import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var desk: DeskModel

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("https://your-dealdex.example", text: $desk.origin)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                    TextField("Email", text: $desk.loginEmail)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    SecureField("Password", text: $desk.loginPassword)
                    if desk.accountEmail.isEmpty {
                        Button(desk.accountBusy ? "Working…" : "Sign In") { Task { await desk.signIn(signup: false) } }
                            .disabled(desk.accountBusy)
                        Button("Create Account") { Task { await desk.signIn(signup: true) } }
                            .disabled(desk.accountBusy)
                    } else {
                        Text("Signed in as \(desk.accountEmail)")
                        Button("Pull Keys from Account") { Task { await desk.pullKeys() } }
                            .disabled(desk.accountBusy)
                        Button("Push Phone Keys to Account") { Task { await desk.pushKeys() } }
                            .disabled(desk.accountBusy)
                        Button("Sign Out", role: .destructive) { desk.signOut() }
                    }
                } header: {
                    Text("Account")
                } footer: {
                    Text("Optional. Scan works signed out. Use the same email as the website to back up keys.")
                }

                Section {
                    SecureField("JustTCG Key", text: $desk.justTcg)
                    SecureField("PriceCharting Token", text: $desk.priceCharting)
                    SecureField("Pokémon TCG API Key", text: $desk.pokemonTcg)
                    Button("Save on This iPhone") { desk.saveKeys() }
                } header: {
                    Text("API Desks")
                } footer: {
                    Text("Keys stay on this phone. DealDex talks to eBay, Mercari, TCGDex, and these desks directly.")
                }

                if let note = desk.accountNote {
                    Section { Text(note).font(.footnote) }
                }
                if let note = desk.settingsNote {
                    Section { Text(note).font(.footnote) }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
