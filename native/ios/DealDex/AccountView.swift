import SwiftUI

struct AccountView: View {
    @EnvironmentObject var desk: DeskModel

    var body: some View {
        NavigationStack {
            Form {
                Section("Website (optional)") {
                    TextField("https://dealdex.online", text: $desk.origin)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .keyboardType(.URL)
                    TextField("Email", text: $desk.loginEmail)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    SecureField("Password", text: $desk.loginPassword)
                }
                if desk.accountEmail.isEmpty {
                    Section {
                        Button(desk.accountBusy ? "Working…" : "Sign in with Google") {
                            Task { await desk.signInGoogle() }
                        }
                        .disabled(desk.accountBusy)
                        Button(desk.accountBusy ? "Working…" : "Sign in") { Task { await desk.signIn(signup: false) } }
                            .disabled(desk.accountBusy)
                        Button("Create account") { Task { await desk.signIn(signup: true) } }
                            .disabled(desk.accountBusy)
                    } footer: {
                        Text("Optional.  Scan works signed out with keys saved on this phone.  Google accounts use Sign in with Google.")
                    }
                } else {
                    Section {
                        Text("Signed in as \(desk.accountEmail)")
                        Button("Pull keys from account") { Task { await desk.pullKeys() } }
                            .disabled(desk.accountBusy)
                        Button("Push phone keys to account") { Task { await desk.pushKeys() } }
                            .disabled(desk.accountBusy)
                        Button("Sign out", role: .destructive) { desk.signOut() }
                    } footer: {
                        Text("Pull copies keys onto this phone. After that, DealDex keeps working if the site is down.")
                    }
                }
                if let note = desk.accountNote {
                    Section { Text(note).font(.footnote) }
                }
            }
            .navigationTitle("Account")
        }
    }
}
