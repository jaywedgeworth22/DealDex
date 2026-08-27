import AuthenticationServices
import CryptoKit
import Foundation
import Security
import UIKit

enum NativeAuthError: LocalizedError {
    case cancelled
    case missingToken
    case server(String)

    var errorDescription: String? {
        switch self {
        case .cancelled: return "Sign-in was cancelled."
        case .missingToken: return "Sign-in did not complete.  Try again."
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

    /// PKCE verifier: high-entropy, generated per attempt, never leaves the app.
    private static func newVerifier() -> String {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)
        return Data(bytes).base64URLEncoded()
    }

    private static func challenge(for verifier: String) -> String {
        Data(SHA256.hash(data: Data(verifier.utf8))).base64URLEncoded()
    }

    /// Sign in through the website, then trade a single-use code for the session
    /// token.
    ///
    /// The callback lands on `dealdex://`, a custom scheme that is not exclusive
    /// to this app. It used to carry the live session token, so anything that
    /// claimed the scheme could take over the account. Now it carries only a
    /// code, and redeeming it needs the verifier held here.
    static func signIn(origin: String, provider: String = "google") async throws -> AccountApi.Session {
        let site = Self.normalized(origin)
        let verifier = newVerifier()
        let challengeValue = challenge(for: verifier)
        guard
            let start = URL(
                string: "\(site)/api/native/oauth?provider=\(provider)&challenge=\(challengeValue)"
            )
        else {
            throw NativeAuthError.server("Website origin is not a valid URL.")
        }
        let presenter = NativeAuthPresenter()
        let callback = try await withCheckedThrowingContinuation { (cont: CheckedContinuation<URL, Error>) in
            let session = ASWebAuthenticationSession(url: start, callbackURLScheme: "dealdex") { url, error in
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
        guard let code = dict["code"], !code.isEmpty else {
            throw NativeAuthError.missingToken
        }
        return try await exchange(site: site, code: code, verifier: verifier)
    }

    /// Second leg: `code` + `verifier` -> session token, over HTTPS.
    private static func exchange(site: String, code: String, verifier: String) async throws -> AccountApi.Session {
        guard let url = URL(string: "\(site)/api/native/exchange") else {
            throw NativeAuthError.server("Website origin is not a valid URL.")
        }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("DealDex/1.0 (ios)", forHTTPHeaderField: "User-Agent")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["code": code, "verifier": verifier])
        let (data, res) = try await URLSession.shared.data(for: req)
        let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
        let status = (res as? HTTPURLResponse)?.statusCode ?? 0
        if status >= 400 {
            throw NativeAuthError.server(json["error"] as? String ?? "Sign-in could not be completed.")
        }
        guard let token = json["token"] as? String, !token.isEmpty else {
            throw NativeAuthError.missingToken
        }
        return AccountApi.Session(token: token, email: json["email"] as? String ?? "")
    }

    static func normalized(_ origin: String) -> String {
        var s = origin.trimmingCharacters(in: .whitespacesAndNewlines)
        s = s.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        if s.isEmpty { return defaultOrigin }
        if !s.contains("://") { s = "https://\(s)" }
        return s
    }
}


private extension Data {
    /// base64url, matching what the server's `base64url` encoding expects.
    func base64URLEncoded() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}
