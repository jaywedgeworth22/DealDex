import SwiftUI

@main
struct DealDexApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

struct RootView: View {
    @StateObject private var desk = DeskModel()

    var body: some View {
        TabView {
            ScanView()
                .environmentObject(desk)
                .tabItem { Label("Scan", systemImage: "dot.radiowaves.left.and.right") }
            EvaluatorView()
                .tabItem { Label("Evaluator", systemImage: "slider.horizontal.3") }
            SavedView()
                .tabItem { Label("Saved", systemImage: "bookmark") }
            AlertsView()
                .environmentObject(desk)
                .tabItem { Label("Alerts", systemImage: "bell") }
            SettingsView()
                .environmentObject(desk)
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .tint(Color(red: 63 / 255, green: 74 / 255, blue: 50 / 255))
        .preferredColorScheme(.light)
        .appUpdatePrompt()
    }
}
