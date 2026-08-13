import SwiftUI

struct ScanView: View {
    @EnvironmentObject var desk: DeskModel
    private let chips: [(String, String)] = [("", "All Pokémon"), ("charizard", "charizard"), ("umbreon vmax", "umbreon vmax"), ("151", "151")]

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 12) {
                Text("POKÉMON LISTING DESK")
                    .font(.caption)
                    .tracking(1.4)
                    .foregroundStyle(.secondary)
                Text("Find the best listings.")
                    .font(.system(.title, design: .serif))
                HStack {
                    TextField("All Pokémon", text: $desk.query)
                        .textFieldStyle(.roundedBorder)
                    Button("Scan") { Task { await desk.scan() } }
                        .buttonStyle(.borderedProminent)
                        .disabled(desk.loading)
                }
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(chips, id: \.0) { q, label in
                            Button(label) { Task { await desk.scan(q) } }
                                .buttonStyle(.bordered)
                        }
                    }
                }
                HStack {
                    chip("all", "All \(desk.rows.count)")
                    chip("deals", "Deals")
                    Button { desk.view = "ebay" } label: { MarketplaceMark(market: "ebay") }
                        .buttonStyle(.bordered)
                        .tint(desk.view == "ebay" ? Color(red: 0.25, green: 0.29, blue: 0.20) : .secondary)
                    Button { desk.view = "mercari" } label: { MarketplaceMark(market: "mercari") }
                        .buttonStyle(.bordered)
                        .tint(desk.view == "mercari" ? Color(red: 0.25, green: 0.29, blue: 0.20) : .secondary)
                }
                if desk.loading {
                    Spacer()
                    ProgressView("Reading eBay and Mercari…")
                    Spacer()
                } else if let err = desk.error {
                    Text(err).foregroundStyle(.red)
                } else {
                    List(desk.visible) { row in
                        ListingRow(row: row)
                    }
                    .listStyle(.plain)
                }
            }
            .padding()
            .background(Color(red: 0.95, green: 0.94, blue: 0.90))
        }
    }

    private func chip(_ key: String, _ label: String) -> some View {
        Button(label) { desk.view = key }
            .buttonStyle(.bordered)
            .tint(desk.view == key ? Color(red: 0.25, green: 0.29, blue: 0.20) : .secondary)
    }
}

struct ListingRow: View {
    let row: ScoredListing

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                MarketplaceMark(market: row.listing.marketplace)
                if let v = row.appraisal?.verdict {
                    Text(v.uppercased()).font(.caption).foregroundStyle(color(v))
                }
            }
            Text(row.listing.title).font(.subheadline).lineLimit(2)
            if let card = row.card {
                Text("\(card.name) · \(card.setName) #\(card.localId)").font(.caption).foregroundStyle(.secondary)
            }
            HStack(spacing: 16) {
                Text(money(row.listing.price) + " ask").font(.system(.caption, design: .monospaced))
                Text(money(row.appraisal?.adjusted) + " TCGP").font(.system(.caption, design: .monospaced))
                if let s = row.appraisal?.spread {
                    Text(String(format: "%+.1f%%", s * 100)).font(.system(.caption, design: .monospaced))
                        .foregroundStyle(color(row.appraisal?.verdict ?? "fair"))
                }
            }
            if let url = URL(string: row.listing.url) {
                Link("Open listing", destination: url)
            }
        }
        .padding(.vertical, 4)
    }

    private func money(_ n: Double?) -> String {
        guard let n else { return "—" }
        return String(format: "$%.2f", n)
    }

    private func color(_ v: String) -> Color {
        switch v {
        case "steal", "good": return Color(red: 0.25, green: 0.35, blue: 0.22)
        case "high", "avoid": return Color(red: 0.56, green: 0.31, blue: 0.27)
        default: return Color(red: 0.48, green: 0.40, blue: 0.22)
        }
    }
}

struct MarketplaceMark: View {
    let market: String

    var body: some View {
        if market == "ebay" {
            HStack(spacing: 0) {
                Text("e").foregroundStyle(Color(red: 0.90, green: 0.17, blue: 0.18))
                Text("b").foregroundStyle(Color(red: 0.04, green: 0.41, blue: 0.96))
                Text("a").foregroundStyle(Color(red: 1.0, green: 0.74, blue: 0.07))
                Text("y").foregroundStyle(Color(red: 0.58, green: 0.78, blue: 0.13))
            }
            .font(.caption.weight(.bold))
            .accessibilityLabel("eBay")
        } else {
            Text("mercari")
                .font(.caption.weight(.bold))
                .foregroundStyle(Color(red: 0.91, green: 0.13, blue: 0.13))
                .accessibilityLabel("Mercari")
        }
    }
}
