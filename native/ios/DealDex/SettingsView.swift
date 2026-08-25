import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var desk: DeskModel

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("https://dealdex.net", text: $desk.origin)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                        .textContentType(.URL)
                    if desk.accountEmail.isEmpty {
                        Button(desk.accountBusy ? "Working…" : "Sign in with Google") {
                            Task { await desk.signInGoogle() }
                        }
                        .disabled(desk.accountBusy)
                        TextField("Email", text: $desk.loginEmail)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                        SecureField("Password", text: $desk.loginPassword)
                        Button(desk.accountBusy ? "Working…" : "Sign In with email") { Task { await desk.signIn(signup: false) } }
                            .disabled(desk.accountBusy)
                        Button("Create Account") { Task { await desk.signIn(signup: true) } }
                            .disabled(desk.accountBusy)
                    } else {
                        Text("Signed in as \(desk.accountEmail)")
                        Button("Pull Keys from Account") { Task { await desk.pullKeys() } }
                            .disabled(desk.accountBusy)
                        Button("Push Phone Keys to Account") { Task { await desk.pushKeys() } }
                            .disabled(desk.accountBusy)
                        Button("Sign Out", role: .destructive) { desk.signOut() }
                    }
                } header: {
                    Text("Account")
                } footer: {
                    Text("Website is https://dealdex.net by default.  Leave it unless you are on a preview host.  Scan works without signing in.  Google website accounts use Sign in with Google — email and password is only for accounts you created that way.")
                }

                Section {
                    SecureField("JustTCG Key", text: $desk.justTcg)
                    SecureField("PriceCharting Token", text: $desk.priceCharting)
                    SecureField("Pokémon TCG API Key", text: $desk.pokemonTcg)
                    Button("Save on This iPhone") { desk.saveKeys() }
                } header: {
                    Text("API Desks")
                } footer: {
                    Text("Keys stay on this phone.  DealDex talks to eBay, Mercari, TCGDex, and these desks directly.")
                }

                if let note = desk.accountNote {
                    Section { Text(note).font(.footnote) }
                }
                if let note = desk.settingsNote {
                    Section { Text(note).font(.footnote) }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
