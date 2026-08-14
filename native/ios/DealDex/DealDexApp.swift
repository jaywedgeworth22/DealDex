import SwiftUI
import UserNotifications

@main
struct DealDexApp: App {
    init() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

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
            AlertsView()
                .environmentObject(desk)
                .tabItem { Label("Alerts", systemImage: "bell") }
            SettingsView()
                .environmentObject(desk)
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .tint(Color(red: 0.25, green: 0.29, blue: 0.20))
    }
}
