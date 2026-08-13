import Foundation

struct LiveListing: Identifiable, Hashable {
    var id: String
    var marketplace: String
    var title: String
    var url: String
    var price: Double?
    var shipping: Double
    var image: String?
    var compositeId: String { marketplace + id }
}

struct Finish: Hashable {
    var key: String
    var label: String
    var market: Double?
}

struct TcgCard: Hashable {
    var id: String
    var name: String
    var localId: String
    var setName: String
    var setId: String
    var rarity: String?
    var image: String?
    var finishes: [Finish]
    var cardmarketEur: Double?
}

struct Appraisal: Hashable {
    var market: Double?
    var adjusted: Double?
    var allIn: Double
    var spread: Double?
    var verdict: String
}

struct ScoredListing: Identifiable, Hashable {
    var id: String { listing.compositeId }
    var listing: LiveListing
    var card: TcgCard?
    var appraisal: Appraisal?
    var grade: String
}

struct AlertRule: Identifiable, Hashable {
    var id: String
    var name: String
    var enabled: Bool = true
    var keyword: String = ""
    var minSpread: Double? = 0.12
    var maxPrice: Double? = 100
}
