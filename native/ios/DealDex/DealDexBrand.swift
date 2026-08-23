import SwiftUI

enum DealDexCopy {
    static let subtitle = "Find the best-priced Pokémon card listings"
}

/// Official title wordmark (red Deal + blue Dex, yellow rim). Not the home-screen AppIcon.
struct DealDexTitle: View {
    var height: CGFloat = 36

    var body: some View {
        Image("DealDexWordmark")
            .resizable()
            .scaledToFit()
            .frame(height: height)
            .accessibilityLabel("DealDex")
    }
}

/// Isolated interlocking DD. Preview / in-app mark only — live AppIcon is the ST-grid catalog.
struct DealDexMark: View {
    var size: CGFloat = 36

    var body: some View {
        Image("DealDexMark")
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}
