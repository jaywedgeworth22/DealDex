import Foundation

struct DeskKeys: Equatable {
    var justTcg = ""
    var priceCharting = ""
    var pokemonTcg = ""
    var any: Bool { !justTcg.isEmpty || !priceCharting.isEmpty || !pokemonTcg.isEmpty }
}

enum DeskStore {
    private static let d = UserDefaults.standard

    static var keys: DeskKeys {
        get {
            DeskKeys(
                justTcg: d.string(forKey: "dealdex.justtcg") ?? "",
                priceCharting: d.string(forKey: "dealdex.pricecharting") ?? "",
                pokemonTcg: d.string(forKey: "dealdex.pokemontcg") ?? ""
            )
        }
        set {
            d.set(newValue.justTcg, forKey: "dealdex.justtcg")
            d.set(newValue.priceCharting, forKey: "dealdex.pricecharting")
            d.set(newValue.pokemonTcg, forKey: "dealdex.pokemontcg")
        }
    }

    static var origin: String {
        get { d.string(forKey: "dealdex.origin") ?? "" }
        set { d.set(newValue.trimmingCharacters(in: CharacterSet(charactersIn: "/")), forKey: "dealdex.origin") }
    }

    static var token: String {
        get { d.string(forKey: "dealdex.token") ?? "" }
        set { d.set(newValue, forKey: "dealdex.token") }
    }

    static var email: String {
        get { d.string(forKey: "dealdex.email") ?? "" }
        set { d.set(newValue, forKey: "dealdex.email") }
    }

    static var signedIn: Bool { !token.isEmpty }
}
