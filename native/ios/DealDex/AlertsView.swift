import SwiftUI
import UserNotifications

struct AlertsView: View {
    @EnvironmentObject var desk: DeskModel

    var body: some View {
        NavigationStack {
            Form {
                Section("Native deal pings") {
                    TextField("Name", text: $desk.rule.name)
                    TextField("Keyword (blank = all Pokémon)", text: $desk.rule.keyword)
                    TextField("Max ask", text: maxAsk)
                        .keyboardType(.decimalPad)
                    TextField("Min spread %", text: minSpread)
                        .keyboardType(.decimalPad)
                    Toggle("Alerts on", isOn: $desk.rule.enabled)
                }
                Section {
                    Button("Scan now and notify") {
                        Task {
                            await Self.askNotify()
                            await desk.scan(notify: true)
                        }
                    }
                } footer: {
                    Text("Matches fire after each scan on this phone.")
                }
            }
            .navigationTitle("Alerts")
        }
    }

    private static func askNotify() async {
        _ = try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
    }

    private var maxAsk: Binding<String> {
        Binding(
            get: { desk.rule.maxPrice.map { String(Int($0)) } ?? "" },
            set: { desk.rule.maxPrice = Double($0) }
        )
    }

    private var minSpread: Binding<String> {
        Binding(
            get: { desk.rule.minSpread.map { String(Int($0 * 100)) } ?? "" },
            set: { desk.rule.minSpread = Double($0).map { $0 / 100 } }
        )
    }
}
