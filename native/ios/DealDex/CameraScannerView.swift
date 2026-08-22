import SwiftUI
import Vision

struct CameraScannerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var recognizedTokens: [String] = []
    @State private var detectedName: String = ""
    @State private var detectedNumber: String = ""
    @State private var isProcessing: Bool = false
    @State private var statusMessage: String = "Align camera with card or slab label"
    var onCardDetected: ((String) -> Void)?

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Viewfinder frame
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.black.opacity(0.85))
                        .frame(maxWidth: .infinity, maxHeight: 320)

                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.yellow, style: StrokeStyle(lineWidth: 2, dash: [8, 4]))
                        .frame(width: 200, height: 280)

                    VStack {
                        Spacer()
                        Text(statusMessage)
                            .font(.caption)
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(Capsule().fill(Color.black.opacity(0.6)))
                            .padding(.bottom, 12)
                    }
                }
                .padding(.horizontal)

                VStack(alignment: .leading, spacing: 12) {
                    Text("DETECTED CARD ATTRIBUTES")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(.secondary)

                    HStack {
                        VStack(alignment: .leading) {
                            Text("Card / Pokémon:").font(.caption).foregroundStyle(.secondary)
                            Text(detectedName.isEmpty ? "Scanning…" : detectedName)
                                .font(.headline)
                        }
                        Spacer()
                        if !detectedNumber.isEmpty {
                            VStack(alignment: .trailing) {
                                Text("Card #").font(.caption).foregroundStyle(.secondary)
                                Text(detectedNumber).font(.headline.monospaced())
                            }
                        }
                    }
                    .padding()
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.white))

                    if !detectedName.isEmpty {
                        Button {
                            let query = detectedNumber.isEmpty ? detectedName : "\(detectedName) \(detectedNumber)"
                            onCardDetected?(query)
                            dismiss()
                        } label: {
                            HStack {
                                Image(systemName: "sparkles")
                                Text("Appraise Detected Card")
                            }
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(red: 0.25, green: 0.29, blue: 0.20))
                        .padding(.top, 8)
                    }
                }
                .padding(.horizontal)

                Spacer()
            }
            .background(Color(red: 0.95, green: 0.94, blue: 0.90))
            .navigationTitle("Card & Slab Scanner")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .onAppear {
                simulateScan()
            }
        }
    }

    private func simulateScan() {
        // Quick visual text extraction test pipeline
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            detectedName = "Charizard"
            detectedNumber = "4/102"
            statusMessage = "Card matched: Charizard 4/102"
        }
    }
}
