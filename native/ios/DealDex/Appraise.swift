import Foundation

enum Appraise {
    static let skip = try! NSRegularExpression(
        pattern: #"\b(lots?\b|\d+\s+cards\b|bulk|binder|choose your|etb|booster|proxy|custom\b|plush|hoodie)\b"#,
        options: .caseInsensitive
    )

    static func skipListing(_ title: String) -> Bool {
        let r = NSRange(title.startIndex..., in: title)
        return skip.firstMatch(in: title, range: r) != nil
    }

    static func parseMoney(_ raw: String?) -> Double? {
        guard let raw, let n = Double(raw.replacingOccurrences(of: ",", with: "")) , n > 0 else { return nil }
        return n
    }

    static func tokens(_ query: String) -> [String] {
        let generic: Set<String> = ["pokemon", "pokémon", "tcg", "card", "cards", "holo", "rare"]
        return query.lowercased()
            .replacingOccurrences(of: "[^a-z0-9\\s]", with: " ", options: .regularExpression)
            .split(separator: " ").map(String.init)
            .filter { $0.count > 2 && !generic.contains($0) }
    }

    static func titleMatches(_ title: String, _ query: String) -> Bool {
        guard let t = tokens(query).first else { return true }
        return title.lowercased().contains(t)
    }

    static func detectGrade(_ text: String) -> String {
        let t = text.lowercased()
        if t.contains("psa 10") || t.contains("psa10") { return "PSA 10" }
        if t.contains("bgs 10") { return "BGS 10" }
        if t.contains("cgc 10") { return "CGC 10" }
        if t.contains("psa 9") { return "PSA 9" }
        return "raw"
    }

    static func conditionMult(_ text: String) -> Double {
        let t = text.lowercased()
        if t.contains("dmg") || t.contains("damaged") { return 0.2 }
        if t.contains("hp") { return 0.35 }
        if t.contains("mp") || t.contains("played") { return 0.55 }
        if t.contains("lp") { return 0.8 }
        return 1
    }

    static func gradeMult(card: TcgCard?, grade: String) -> Double {
        if grade == "raw" { return 1 }
        let set = "\(card?.setId ?? "") \(card?.setName ?? "")".lowercased()
        let vintage = set.range(of: "base1|jungle|fossil|neo|wotc|base set", options: .regularExpression) != nil
        if grade.contains("10") && !grade.contains("9.5") {
            if vintage { return 4 }
            return 1.25
        }
        return 1.35
    }

    static func nameQuery(_ title: String) -> String {
        let stop: Set<String> = ["pokemon", "pokémon", "tcg", "card", "cards", "holo", "rare", "nm", "psa", "bgs", "cgc", "english"]
        let cleaned = title.lowercased()
            .replacingOccurrences(of: #"https?://\S+"#, with: " ", options: .regularExpression)
            .replacingOccurrences(of: #"\$[0-9,.]+"#, with: " ", options: .regularExpression)
            .replacingOccurrences(of: #"[^a-z0-9'\s-]"#, with: " ", options: .regularExpression)
        let parts = cleaned.split(separator: " ").map(String.init)
            .filter { !$0.isEmpty && !stop.contains($0) && Int($0) == nil }
        return parts.prefix(4).joined(separator: " ").isEmpty ? "pokemon" : parts.prefix(4).joined(separator: " ")
    }

    static func appraise(card: TcgCard, listing: LiveListing, grade: String, extra: Double? = nil) -> Appraisal {
        let seed = [card.finishes.first(where: { $0.market != nil })?.market, extra].compactMap { $0 }
        let raw = seed.isEmpty ? nil : seed.reduce(0, +) / Double(seed.count)
        let adjusted = raw.map { $0 * conditionMult(listing.title) * gradeMult(card: card, grade: grade) }
        let allIn = (listing.price ?? 0) + listing.shipping
        let spread = (adjusted != nil && adjusted! > 0) ? (adjusted! - allIn) / adjusted! : nil
        let verdict: String
        switch spread {
        case .some(let s) where s >= 0.30: verdict = "steal"
        case .some(let s) where s >= 0.12: verdict = "good"
        case .some(let s) where s >= -0.08: verdict = "fair"
        case .some(let s) where s >= -0.30: verdict = "high"
        case .some: verdict = "avoid"
        default: verdict = "fair"
        }
        return Appraisal(market: raw, adjusted: adjusted, allIn: allIn, spread: spread, verdict: verdict)
    }
}
