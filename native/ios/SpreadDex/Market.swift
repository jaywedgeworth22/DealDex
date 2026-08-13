import Foundation

enum Market {
    private static let jina = "https://r.jina.ai/"
    private static let tcg = "https://api.tcgdex.net/v2/en"

    static func scan(_ query: String, keys: DeskKeys = DeskKeys()) async throws -> [ScoredListing] {
        let q = query.trimmingCharacters(in: .whitespaces)
        let ebayQ = Appraise.tokens(q).isEmpty ? "pokemon" : q
        let mercQ = Appraise.tokens(q).isEmpty ? "pokemon card" : "\(q) pokemon card"
        async let ebayMd = get("\(jina)https://www.ebay.com/sch/183454/i.html?_nkw=\(enc(ebayQ))&LH_BIN=1&_ipg=60&_udlo=3&_sop=10")
        async let mercMd = get("\(jina)https://www.mercari.com/search/?keyword=\(enc(mercQ))")
        let listings = parseEbay(try await ebayMd, q) + parseMercari(try await mercMd, q)
        var cache: [String: [TcgCard]] = [:]
        var extraCache: [String: Double?] = [:]
        var scored: [ScoredListing] = []
        for listing in listings {
            let name = Appraise.nameQuery(listing.title)
            let grade = Appraise.detectGrade(listing.title)
            if cache[name] == nil { cache[name] = (try? await searchCards(name)) ?? [] }
            let card = pick(cache[name] ?? [], listing)
            var extra: Double? = nil
            if let card, keys.any {
                if extraCache[card.id] == nil { extraCache[card.id] = await PaidDesks.blend(card: card, keys: keys) }
                extra = extraCache[card.id] ?? nil
            }
            let appraisal = card.flatMap { listing.price == nil ? nil : Appraise.appraise(card: $0, listing: listing, grade: grade, extra: extra) }
            scored.append(ScoredListing(listing: listing, card: card, appraisal: appraisal, grade: grade))
        }
        return scored.sorted { ($0.appraisal?.spread ?? -99) > ($1.appraisal?.spread ?? -99) }
    }

    private static func pick(_ cards: [TcgCard], _ listing: LiveListing) -> TcgCard? {
        guard !cards.isEmpty else { return nil }
        let ask = (listing.price ?? 0) + listing.shipping
        return cards.min { a, b in
            abs((a.finishes.first?.market ?? 0) - ask) < abs((b.finishes.first?.market ?? 0) - ask)
        }
    }

    static func searchCards(_ name: String) async throws -> [TcgCard] {
        let raw = try await get("\(tcg)/cards?name=\(enc(name))&pagination:itemsPerPage=8", accept: "application/json")
        guard let data = raw.data(using: .utf8),
              let arr = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { return [] }
        var out: [TcgCard] = []
        for item in arr.prefix(8) {
            if let id = item["id"] as? String, let card = try? await fetchCard(id) { out.append(card) }
        }
        return out
    }

    static func fetchCard(_ id: String) async throws -> TcgCard? {
        let raw = try await get("\(tcg)/cards/\(enc(id))", accept: "application/json")
        guard let data = raw.data(using: .utf8),
              let o = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { return nil }
        let set = o["set"] as? [String: Any]
        let pricing = o["pricing"] as? [String: Any]
        let tcgplayer = pricing?["tcgplayer"] as? [String: Any]
        let cm = pricing?["cardmarket"] as? [String: Any]
        var finishes: [Finish] = []
        tcgplayer?.forEach { key, value in
            guard let block = value as? [String: Any] else { return }
            let market = block["marketPrice"] as? Double
            if market != nil || block["midPrice"] != nil {
                finishes.append(Finish(key: key, label: key, market: market))
            }
        }
        return TcgCard(
            id: o["id"] as? String ?? id,
            name: o["name"] as? String ?? "",
            localId: String(describing: o["localId"] ?? ""),
            setName: set?["name"] as? String ?? "Unknown set",
            setId: set?["id"] as? String ?? "",
            rarity: o["rarity"] as? String,
            image: o["image"] as? String,
            finishes: finishes,
            cardmarketEur: cm?["trend"] as? Double ?? cm?["avg"] as? Double
        )
    }

    private static func get(_ url: String, accept: String = "text/plain") async throws -> String {
        var req = URLRequest(url: URL(string: url)!)
        req.setValue("DealDex/1.0 (ios)", forHTTPHeaderField: "User-Agent")
        req.setValue(accept, forHTTPHeaderField: "Accept")
        let (data, _) = try await URLSession.shared.data(for: req)
        return String(data: data, encoding: .utf8) ?? ""
    }

    private static func enc(_ s: String) -> String {
        s.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? s
    }

    private static func firstPrice(_ text: String) -> Double? {
        if let m = text.range(of: #"(?:^|\n)\s*\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{2}))"#, options: .regularExpression) {
            let slice = String(text[m]).replacingOccurrences(of: "$", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
            if let n = parseMoneyLoose(slice), n >= 2.5 { return n }
        }
        let re = try! NSRegularExpression(pattern: #"\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{2})?)"#)
        let ns = text as NSString
        for m in re.matches(in: text, range: NSRange(location: 0, length: ns.length)) {
            if let n = parseMoneyLoose(ns.substring(with: m.range(at: 1))), n >= 2.5, n < 1_000_000 { return n }
        }
        return nil
    }

    private static func parseMoneyLoose(_ s: String) -> Double? {
        Double(s.replacingOccurrences(of: ",", with: ""))
    }

    private static func parseEbay(_ md: String, _ query: String) -> [LiveListing] {
        let re = try! NSRegularExpression(pattern: #"\[([^\]]{8,220})\]\(https://www\.ebay\.com/itm/(\d{12,14})[^)]*\)([\s\S]{0,700})"#)
        let ns = md as NSString
        var seen = Set<String>()
        var out: [LiveListing] = []
        for m in re.matches(in: md, range: NSRange(location: 0, length: ns.length)) {
            let id = ns.substring(with: m.range(at: 2))
            if !seen.insert(id).inserted { continue }
            var title = ns.substring(with: m.range(at: 1))
            title = title.replacingOccurrences(of: "Opens in a new window or tab", with: "", options: .caseInsensitive).trimmingCharacters(in: .whitespaces)
            if title.isEmpty || title.localizedCaseInsensitiveContains("shop on ebay") || Appraise.skipListing(title) { continue }
            if !Appraise.titleMatches(title, query) { continue }
            let chunk = ns.substring(with: m.range(at: 3))
            guard let price = firstPrice(chunk) else { continue }
            out.append(LiveListing(id: id, marketplace: "ebay", title: title, url: "https://www.ebay.com/itm/\(id)", price: price, shipping: 4.47, image: nil))
            if out.count >= 16 { break }
        }
        return out
    }

    private static func parseMercari(_ md: String, _ query: String) -> [LiveListing] {
        let re = try! NSRegularExpression(pattern: #"\[([\s\S]{8,500}?)\]\(https://www\.mercari\.com/us/item/(m\d+)/?[^)]*\)"#)
        let ns = md as NSString
        var seen = Set<String>()
        var out: [LiveListing] = []
        for m in re.matches(in: md, range: NSRange(location: 0, length: ns.length)) {
            let id = ns.substring(with: m.range(at: 2))
            if !seen.insert(id).inserted { continue }
            let inner = ns.substring(with: m.range(at: 1))
            let text = inner.replacingOccurrences(of: #"!\[[^\]]*]\([^)]+\)"#, with: " ", options: .regularExpression)
            let title = text.replacingOccurrences(of: #"\$[0-9,.]+\s*"#, with: " ", options: .regularExpression)
                .replacingOccurrences(of: #"\s+"#, with: " ", options: .regularExpression)
                .trimmingCharacters(in: .whitespaces)
            if title.isEmpty || Appraise.skipListing(title) || !Appraise.titleMatches(title, query) { continue }
            out.append(LiveListing(id: id, marketplace: "mercari", title: title, url: "https://www.mercari.com/us/item/\(id)/", price: firstPrice(text), shipping: 4.49, image: nil))
            if out.count >= 16 { break }
        }
        return out
    }
}
