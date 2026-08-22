import AuthenticationServices
import Foundation
import UIKit

enum NativeAuthError: LocalizedError {
    case cancelled
    case missingToken
    case server(String)

    var errorDescription: String? {
        switch self {
        case .cancelled: return "Sign-in was cancelled."
        case .missingToken: return "No session token from the website."
        case .server(let m): return m
        }
    }
}

final class NativeAuthPresenter: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        if let key = scenes.flatMap(\.windows).first(where: \.isKeyWindow) { return key }
        if let any = scenes.flatMap(\.windows).first { return any }
        return ASPresentationAnchor()
    }
}

enum NativeAuth {
    static let defaultOrigin = "https://dealdex.net"
    private static var heldSession: ASWebAuthenticationSession?
    private static var heldPresenter: NativeAuthPresenter?

    static func signIn(origin: String, provider: String = "grok-google") async throws -> AccountApi.Session {
        let site = Self.normalized(origin)
        guard let start = URL(string: "\(site)/api/native/oauth?provider=\(provider)") else {
            throw NativeAuthError.server("Website origin is not a valid URL.")
        }
        let presenter = NativeAuthPresenter()
        let callback = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<URL, Error>) in
            let session = ASWebAuthenticationSession(url: start, callback: .customScheme("dealdex")) { url, error in
                heldSession = nil
                heldPresenter = nil
                if let error {
                    let ns = error as NSError
                    if ns.domain == ASWebAuthenticationSessionError.errorDomain,
                       ns.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        cont.resume(throwing: NativeAuthError.cancelled)
                    } else {
                        cont.resume(throwing: error)
                    }
                    return
                }
                guard let url else {
                    cont.resume(throwing: NativeAuthError.missingToken)
                    return
                }
                cont.resume(returning: url)
            }
            session.presentationContextProvider = presenter
            session.prefersEphemeralWebBrowserSession = false
            heldPresenter = presenter
            heldSession = session
            if !session.start() {
                heldSession = nil
                heldPresenter = nil
                cont.resume(throwing: NativeAuthError.server("Could not start sign-in."))
            }
        }
        let items = URLComponents(url: callback, resolvingAgainstBaseURL: false)?.queryItems ?? []
        let dict = Dictionary(uniqueKeysWithValues: items.compactMap { item in
            item.value.map { (item.name, $0) }
        })
        if let err = dict["error"], !err.isEmpty {
            throw NativeAuthError.server(err.replacingOccurrences(of: "_", with: " "))
        }
        guard let token = dict["token"], !token.isEmpty else {
            throw NativeAuthError.missingToken
        }
        return AccountApi.Session(token: token, email: dict["email"] ?? "")
    }

    static func normalized(_ origin: String) -> String {
        var s = origin.trimmingCharacters(in: .whitespacesAndNewlines)
        s = s.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if s.isEmpty { return defaultOrigin }
        if !s.contains("://") { s = "https://\(s)" }
        return s
    }
}
