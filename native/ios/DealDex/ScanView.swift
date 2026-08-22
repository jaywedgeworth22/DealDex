import SwiftUI

struct ScanView: View {
    @EnvironmentObject var desk: DeskModel
    @Environment(\.horizontalSizeClass) private var sizeClass
    @State private var showCameraScan: Bool = false

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
                Text("LIVE MARKET SCAN")
                    .font(.caption)
                    .tracking(1.6)
                    .foregroundStyle(Color(red: 0.23, green: 0.22, blue: 0.20))
                    .padding(.leading, 8)
                HStack(spacing: 8) {
                    TextField("Card, set, or leave blank", text: $desk.query)
                        .textFieldStyle(.roundedBorder)
                    Button {
                        showCameraScan = true
                    } label: {
                        Image(systemName: "camera")
                    }
                    .buttonStyle(.bordered)
                }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                    filterMenu("Verdict", selection: $desk.verdictFilter, options: [
                        ("any", "Any Verdict"),
                        ("steal", "Steal"),
                        ("good", "Good Deal"),
                        ("fair", "Fair"),
                        ("high", "High Ask"),
                        ("avoid", "Overpriced"),
                    ])
                    filterMenu("Max Ask", selection: $desk.priceCap, options: [
                        ("any", "Any Price"),
                        ("25", "Under $25"),
                        ("50", "Under $50"),
                        ("100", "Under $100"),
                        ("250", "Under $250"),
                    ])
                    filterMenu("Condition", selection: $desk.condition, options: [
                        ("any", "Raw or Graded"),
                        ("raw", "Raw Only"),
                        ("graded", "Graded Only"),
                    ])
                    filterMenu("Min Discount", selection: $desk.spreadMin, options: [
                        ("any", "Any vs Book"),
                        ("10", "10%+ Under Book"),
                        ("20", "20%+ Under Book"),
                        ("40", "40%+ Under Book"),
                    ])
                    filterMenu("Finish", selection: $desk.finish, options: [
                        ("any", "Any Finish"),
                        ("holo", "Holo"),
                        ("reverse", "Reverse"),
                        ("promo", "Promo"),
                    ])
                    VStack(spacing: 2) {
                        Color.clear.frame(height: 14)
                        Button {
                            desk.hideProxies.toggle()
                        } label: {
                            HStack(spacing: 6) {
                                Image(systemName: desk.hideProxies ? "checkmark.square.fill" : "square")
                                Text("Hide Proxies")
                                    .lineLimit(1)
                            }
                            .font(.subheadline)
                            .foregroundStyle(Color(red: 0.10, green: 0.11, blue: 0.09))
                            .frame(maxWidth: .infinity, minHeight: 36)
                        }
                        .buttonStyle(.plain)
                    }
                }
                Button {
                    Task { await desk.scan(notify: false) }
                } label: {
                    Group {
                        if desk.loading {
                            ProgressView()
                                .tint(Color(red: 0.96, green: 0.95, blue: 0.92))
                        } else {
                            Text("SCAN")
                                .font(.system(size: 34, weight: .semibold, design: .default))
                                .tracking(1.6)
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 64)
                    .foregroundStyle(Color(red: 0.96, green: 0.95, blue: 0.92))
                    .background(Color(red: 0.29, green: 0.20, blue: 0.14))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .disabled(desk.loading)
                .buttonStyle(.plain)
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
                    chip("verified", "Verified \(desk.verifiedCount)")
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
            .sheet(isPresented: $showCameraScan) {
                CameraScannerView { detectedQuery in
                    desk.query = detectedQuery
                    Task { await desk.scan(detectedQuery, notify: false) }
                }
            }
        }
    }

    private func chip(_ key: String, _ label: String) -> some View {
        Button(label) { desk.view = key }
            .buttonStyle(.bordered)
            .tint(desk.view == key ? Color(red: 0.25, green: 0.29, blue: 0.20) : .secondary)
    }

    private func filterMenu(_ title: String, selection: Binding<String>, options: [(String, String)]) -> some View {
        let current = options.first(where: { $0.0 == selection.wrappedValue })?.1 ?? options.first?.1 ?? title
        return VStack(spacing: 2) {
            Text(title.uppercased())
                .font(.caption2.weight(.medium))
                .tracking(1.0)
                .foregroundStyle(Color(red: 0.23, green: 0.22, blue: 0.20))
                .frame(maxWidth: .infinity)
            Menu {
                ForEach(options, id: \.0) { key, name in
                    Button(name) { selection.wrappedValue = key }
                }
            } label: {
                Text(current)
                    .font(.caption)
                    .foregroundStyle(Color(red: 0.10, green: 0.11, blue: 0.09))
                    .lineLimit(1)
                    .frame(maxWidth: .infinity, minHeight: 36)
                    .padding(.horizontal, 4)
                    .background(
                        RoundedRectangle(cornerRadius: 6)
                            .stroke(Color(red: 0.56, green: 0.54, blue: 0.49), lineWidth: 1)
                    )
            }
        }
    }
}

struct ListingRow: View {
    let row: ScoredListing
    @StateObject private var savedStore = SavedStore()
    @State private var isSaved: Bool = false

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            if let img = row.listing.image ?? row.card?.image, let url = URL(string: img) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    default:
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color(white: 0.9))
                    }
                }
                .frame(width: 54, height: 75)
                .clipShape(RoundedRectangle(cornerRadius: 6))
            }

            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    MarketplaceMark(market: row.listing.marketplace)
                    if let v = row.appraisal?.verdict {
                        Text(v.uppercased())
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(color(v))
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(RoundedRectangle(cornerRadius: 4).fill(color(v).opacity(0.12)))
                    }
                    Spacer()
                    Button {
                        toggleSave()
                    } label: {
                        Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                            .font(.caption)
                            .foregroundStyle(isSaved ? Color(red: 0.25, green: 0.45, blue: 0.25) : .secondary)
                    }
                    .buttonStyle(.plain)
                }

                Text(row.listing.title)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(2)

                if let card = row.card {
                    Text("\(card.name) · \(card.setName) #\(card.localId)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 12) {
                    Text(money(row.listing.price) + " ask")
                        .font(.system(.caption, design: .monospaced))
                    Text(money(row.appraisal?.adjusted) + " TCGP")
                        .font(.system(.caption, design: .monospaced))
                        .foregroundStyle(.secondary)
                    if let s = row.appraisal?.spread {
                        Text(String(format: "%+.1f%%", s * 100))
                            .font(.system(.caption, design: .monospaced).weight(.semibold))
                            .foregroundStyle(color(row.appraisal?.verdict ?? "fair"))
                    }
                }

                HStack(spacing: 12) {
                    if let card = row.card {
                        NavigationLink {
                            CardDossierView(card: card)
                        } label: {
                            Text("Card Dossier")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(Color(red: 0.25, green: 0.29, blue: 0.20))
                        }
                    }

                    if let url = URL(string: row.listing.url) {
                        Link(destination: url) {
                            HStack(spacing: 2) {
                                Text("Open Listing")
                                Image(systemName: "arrow.up.right")
                            }
                            .font(.caption)
                        }
                    }
                }
                .padding(.top, 2)
            }
        }
        .padding(.vertical, 2)
    }

    private func toggleSave() {
        guard let card = row.card, let ask = row.listing.price else { return }
        let item = SavedAppraisal(
            cardId: card.id,
            cardName: card.name,
            setName: card.setName,
            localId: card.localId,
            marketplace: row.listing.marketplace,
            listingTitle: row.listing.title,
            listingPrice: ask,
            marketPrice: row.appraisal?.adjusted,
            spread: row.appraisal?.spread,
            verdict: row.appraisal?.verdict ?? "fair",
            condition: "NM",
            grade: row.grade,
            status: "watching",
            createdAt: Date()
        )
        savedStore.save(item: item)
        isSaved = true
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

