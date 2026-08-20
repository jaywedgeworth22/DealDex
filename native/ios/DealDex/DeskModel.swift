import Foundation
import UserNotifications

@MainActor
final class DeskModel: ObservableObject {
    @Published var query = ""
    @Published var loading = false
    @Published var rows: [ScoredListing] = []
    @Published var error: String?
    @Published var view = "all"
    @Published var sources: Set<String> = ["ebay", "mercari"]
    @Published var rule = AlertRule(id: "default", name: "Steals under $100")

    @Published var justTcg = DeskStore.keys.justTcg
    @Published var priceCharting = DeskStore.keys.priceCharting
    @Published var pokemonTcg = DeskStore.keys.pokemonTcg
    @Published var settingsNote: String?

    @Published var origin = DeskStore.origin
    @Published var loginEmail = DeskStore.email
    @Published var loginPassword = ""
    @Published var accountEmail = DeskStore.signedIn ? DeskStore.email : ""
    @Published var accountBusy = false
    @Published var accountNote: String?

    init() { Task { await scan("", notify: false) } }

    var keys: DeskKeys {
        DeskKeys(justTcg: justTcg, priceCharting: priceCharting, pokemonTcg: pokemonTcg)
    }

    var visible: [ScoredListing] {
        rows.filter { row in
            switch view {
            case "ebay": return row.listing.marketplace == "ebay"
            case "mercari": return row.listing.marketplace == "mercari"
            case "deals": return row.appraisal?.verdict == "steal" || row.appraisal?.verdict == "good"
            default: return true
            }
        }
    }

    func toggleSource(_ market: String) {
        if sources.contains(market) {
            if sources.count > 1 { sources.remove(market) }
        } else {
            sources.insert(market)
        }
    }

    func saveKeys() {
        DeskStore.keys = keys
        settingsNote = "Saved on this iPhone. Scan uses them even if the website is down."
    }

    func scan(_ q: String? = nil, notify: Bool = false) async {
        if let q { query = q }
        loading = true
        error = nil
        do {
            let found = try await Market.scan(query, keys: keys, origin: origin, sources: Array(sources))
            rows = found
            if notify { await fireAlerts(found) }
        } catch {
            self.error = error.localizedDescription
        }
        loading = false
    }

    func signInGoogle() async {
        accountBusy = true
        accountNote = nil
        do {
            let session = try await NativeAuth.signIn(origin: origin, provider: "grok-google")
            let site = NativeAuth.normalized(origin)
            DeskStore.origin = site
            DeskStore.token = session.token
            DeskStore.email = session.email
            self.origin = site
            accountEmail = session.email.isEmpty ? "Google" : session.email
            accountNote = "Signed in with Google.  Keys still live on this phone.  Pull or push to sync."
        } catch {
            accountNote = error.localizedDescription + "  Scan still works without signing in."
        }
        accountBusy = false
    }

    func signIn(signup: Bool) async {
        let site = NativeAuth.normalized(origin)
        if loginEmail.isEmpty || loginPassword.count < 8 {
            accountNote = "Email and a password of 8+ characters — or use Sign in with Google if that is how you created the website account.  Scan still works without signing in."
            return
        }
        accountBusy = true
        accountNote = nil
        do {
            let session = try await AccountApi.signIn(origin: site, email: loginEmail, password: loginPassword, signup: signup)
            DeskStore.origin = site
            DeskStore.token = session.token
            DeskStore.email = session.email
            self.origin = site
            accountEmail = session.email
            loginPassword = ""
            accountNote = "Signed in.  Keys still live on this phone.  Pull or push to sync."
        } catch {
            accountNote = error.localizedDescription + " Scan still works with saved keys."
        }
        accountBusy = false
    }

    func pullKeys() async {
        guard DeskStore.signedIn else { accountNote = "Sign in first."; return }
        accountBusy = true
        accountNote = nil
        do {
            let remote = try await AccountApi.pullKeys(origin: DeskStore.origin, token: DeskStore.token)
            if !remote.justTcg.isEmpty { justTcg = remote.justTcg }
            if !remote.priceCharting.isEmpty { priceCharting = remote.priceCharting }
            if !remote.pokemonTcg.isEmpty { pokemonTcg = remote.pokemonTcg }
            DeskStore.keys = keys
            accountNote = "Pulled onto this iPhone. Scan will use them if the site goes down."
        } catch {
            accountNote = error.localizedDescription + " — using keys already on this phone."
        }
        accountBusy = false
    }

    func pushKeys() async {
        guard DeskStore.signedIn else { accountNote = "Sign in first."; return }
        DeskStore.keys = keys
        accountBusy = true
        accountNote = nil
        do {
            try await AccountApi.pushKeys(origin: DeskStore.origin, token: DeskStore.token, keys: keys)
            accountNote = "Phone keys copied to your account."
        } catch {
            accountNote = error.localizedDescription + " — keys stay on this phone."
        }
        accountBusy = false
    }

    func signOut() {
        DeskStore.token = ""
        accountEmail = ""
        accountNote = "Signed out. Saved keys stay on this phone."
    }

    private func fireAlerts(_ rows: [ScoredListing]) async {
        guard rule.enabled else { return }
        let status = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
        guard status == .authorized || status == .provisional else { return }
        for row in rows {
            guard let a = row.appraisal else { continue }
            if let max = rule.maxPrice, (row.listing.price ?? .greatestFiniteMagnitude) > max { continue }
            if let min = rule.minSpread, (a.spread ?? -1) < min { continue }
            if !rule.keyword.isEmpty && !row.listing.title.localizedCaseInsensitiveContains(rule.keyword) { continue }
            if a.verdict != "steal" && a.verdict != "good" { continue }
            let content = UNMutableNotificationContent()
            content.title = rule.name
            content.body = "\(row.listing.title) · $\(row.listing.price ?? 0)"
            let req = UNNotificationRequest(identifier: row.id, content: content, trigger: nil)
            try? await UNUserNotificationCenter.current().add(req)
        }
    }
}
