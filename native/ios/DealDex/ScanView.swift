import SwiftUI

struct ScanView: View {
    @EnvironmentObject var desk: DeskModel
    @Environment(\.horizontalSizeClass) private var sizeClass

    private var twoUp: Bool { sizeClass == .regular }
    private var columns: [GridItem] {
        if twoUp {
            [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]
        } else {
            [GridItem(.flexible())]
        }
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 10) {
                DealDexTitle(height: 38)
                Text(DealDexCopy.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                HStack(spacing: 8) {
                    TextField("Card, set, or leave blank", text: $desk.query)
                        .textFieldStyle(.roundedBorder)
                    Button("Scan") { Task { await desk.scan(notify: false) } }
                        .buttonStyle(.borderedProminent)
                        .disabled(desk.loading)
                }
                HStack(spacing: 8) {
                    MarketplaceToggle(
                        market: "ebay",
                        selected: desk.sources.contains("ebay"),
                        count: desk.ebayCount,
                        large: true
                    ) {
                        desk.toggleSource("ebay")
                        Task { await desk.scan(notify: false) }
                    }
                    MarketplaceToggle(
                        market: "mercari",
                        selected: desk.sources.contains("mercari"),
                        count: desk.mercariCount,
                        large: true
                    ) {
                        desk.toggleSource("mercari")
                        Task { await desk.scan(notify: false) }
                    }
                }
                HStack(spacing: 8) {
                    chip("all", "All \(desk.rows.count)")
                    chip("deals", "Deals \(desk.dealCount)")
                }
                if desk.loading && desk.rows.isEmpty {
                    Spacer()
                    ProgressView("Reading eBay and Mercari…")
                    Spacer()
                } else if let err = desk.error {
                    Text(err).foregroundStyle(.red)
                    Spacer()
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(desk.visible) { row in
                                ListingRow(row: row)
                                    .padding(12)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.white))
                            }
                        }
                    }
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
