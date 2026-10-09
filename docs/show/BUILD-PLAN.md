# 3D show build plan

1. Library: preserve and hash-check vendor files; catalog all 19 characters; export eight selected rigs with atlas textures to ignored local assets. Record source and licence evidence.
2. Foundation and Pit slice: Three.js bundled inside web/show; reuse ../lib/state.js without modifying it. Pure scene projection translates reducer state to positions, mechanisms and camera cues. Time only animates the current event; no simulation can change a result. Local audio is presentation-only. Validate rope cost, escape positions, base and flood against tape. Critical reviewer checkpoint here.
3. Complete the map: Final Ledge, Bridge, Crusher, Disc, lobby, chalk epilogue and podium. Add captions, roster, transcript, transport, chapter navigation, director mode, deep links and sharing. Reference assets through relative URLs.
4. QA: npm run check, pure projection tests, browser checks at 390/768/1440, deterministic settled screenshots, reduced motion, secret visibility, tape changes and frame timing. Capture each stage and a short recording. Critical integrated review, adjudicate, fix and rerun relevant checks.
5. Handoff: small local commits with AGENT-NOTES and a short changelog. No production push or purchased source models in public git. Record actual performance and unverified physical-device/release gates.

Scene graph: environment -> chapter set (shared materials, original meshes and instanced details); cast -> eight separate skinned rigs and labels; effects -> pooled shards/confetti/ripples; camera -> deterministic shot selection; UI -> textContent only, public/director visibility derived from the existing text helpers.

Performance: only active chapter is mounted; eight small GLBs share the atlas after loading; geometry and vendor modules are local bundled assets. Aim for <20 MB initial interactive bytes, 60 fps laptop / 30 fps phone. Measured browser timing is not physical-phone evidence. Defer compression/transcoding where the actual small atlas and meshes already meet byte budgets, document exact totals.
