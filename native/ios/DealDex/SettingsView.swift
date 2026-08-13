import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var desk: DeskModel

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    SecureField("JustTCG key", text: $desk.justTcg)
                    SecureField("PriceCharting token", text: $desk.priceCharting)
                    SecureField("Pokémon TCG API key", text: $desk.pokemonTcg)
                    Button("Save on this iPhone") { desk.saveKeys() }
                } header: {
                    Text("API desks")
                } footer: {
                    Text("Keys stay on this phone. DealDex talks to eBay, Mercari, TCGDex, and these desks directly. The website is optional.")
                }
                if let note = desk.settingsNote {
                    Section { Text(note).font(.footnote) }
                }
            }
            .navigationTitle("Keys")
        }
    }
}
