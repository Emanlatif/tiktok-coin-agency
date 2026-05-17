import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useState, useEffect } from "react";

// ─── ICONS ───────────────────────────────────────────────────────────────────

const CoinIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="11" fill="#F9A825" />
    <circle cx="11" cy="11" r="9" fill="#FFD600" />
    <text x="11" y="15.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#E65100" fontFamily="sans-serif">♪</text>
  </svg>
);

const TikTokLogo = ({ size = 22 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <svg width={size + 6} height={size + 6} viewBox="0 0 28 28" fill="none">
      <path d="M20.5 2.5h-4v15.25a3.75 3.75 0 1 1-3.75-3.75c.35 0 .68.05 1 .13V9.9a8 8 0 1 0 6.75 7.85V9.27A11.23 11.23 0 0 0 26 10.5V6.75A6.77 6.77 0 0 1 20.5 2.5z" fill="#000" />
    </svg>
    <span style={{ fontWeight: 700, fontSize: size, color: "#000", letterSpacing: -0.5 }}>TikTok</span>
  </div>
);

const EyeIcon = ({ show }) =>
  show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// ─── DATA ────────────────────────────────────────────────────────────────────

const packages = [
  { id: 1, coins: 30,    price: 290 },
  { id: 2, coins: 350,   price: 3400 },
  { id: 3, coins: 700,   price: 6700 },
  { id: 4, coins: 1400,  price: 13400 },
  { id: 5, coins: 3500,  price: 33500, popular: true },
  { id: 6, coins: 7000,  price: 66500 },
  { id: 7, coins: 17500, price: 165000 },
  { id: 8, custom: true, label: "Custom", sub: "Large amount supported" },
];

const paymentMethods = [
  { id: "jazzcash",  label: "JazzCash",      color: "#B71C1C", acct: "03001234567" },
  { id: "easypaisa", label: "EasyPaisa",     color: "#1B5E20", acct: "03009876543" },
  { id: "bank",      label: "Bank Transfer", color: "#0D47A1", acct: "PK36HABB0000000001234567" },
];

const fmt = (n) => "PKR " + n.toLocaleString("en-PK");

function getInitial(user) {
  if (!user) return "?";
  if (user.displayName) return user.displayName[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return "U";
}

// ─── INPUT STYLES ─────────────────────────────────────────────────────────────

const baseInp = {
  width: "100%", boxSizing: "border-box",
  border: "1.5px solid #ddd", borderRadius: 8,
  padding: "13px 16px", fontSize: 14,
  outline: "none", fontFamily: "inherit",
  background: "#f8f8f8", color: "#121212",
  transition: "border-color .15s, background .15s",
};

const uploadInpStyle = {
  width: "100%", boxSizing: "border-box",
  border: "1.5px solid #ddd", borderRadius: 6,
  padding: "11px 14px", fontSize: 14,
  outline: "none", fontFamily: "inherit",
  color: "#121212", background: "#fff",
};

function onFocus(e)       { e.target.style.borderColor = "#fe2c55"; e.target.style.background = "#fff"; }
function onBlur(e)        { e.target.style.borderColor = "#ddd";    e.target.style.background = "#f8f8f8"; }
function onUploadFocus(e) { e.target.style.borderColor = "#fe2c55"; }
function onUploadBlur(e)  { e.target.style.borderColor = "#ddd"; }
function onPromoFocus(e)  { e.target.style.borderColor = "#fe2c55"; }
function onPromoBlur(e)   { e.target.style.borderColor = "#ddd"; }

// ─── SHARED ───────────────────────────────────────────────────────────────────

const ErrorBox = ({ msg }) => msg ? (
  <div style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c62828", marginBottom: 16 }}>
    {msg}
  </div>
) : null;

const TopBar = ({ user, onLogout }) => (
  <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
    <TikTokLogo size={20} />
    <div style={{ flex: 1, maxWidth: 460, margin: "0 20px" }}>
      <div style={{ background: "#f1f1f2", borderRadius: 4, display: "flex", alignItems: "center", padding: "7px 14px", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <span style={{ fontSize: 14, color: "#888" }}>Search</span>
      </div>
    </div>
    {user && (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, color: "#555", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.displayName || user.email}
        </span>
        <div
          onClick={onLogout}
          title="Logout karo"
          style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#fe2c55,#25f4ee)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {getInitial(user)}
        </div>
      </div>
    )}
  </div>
);

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

const LoginScreen = ({ onGoSignup }) => {
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !pw) { setError("Email aur password dono bharo!"); return; }
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Email ya password galat hai!");
      } else {
        setError("Kuch masla aa gaya, dobara try karo.");
      }
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim() && pw.trim();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: 60, display: "flex", alignItems: "center" }}>
        <TikTokLogo size={20} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
              <svg width="52" height="52" viewBox="0 0 28 28" fill="none">
                <path d="M20.5 2.5h-4v15.25a3.75 3.75 0 1 1-3.75-3.75c.35 0 .68.05 1 .13V9.9a8 8 0 1 0 6.75 7.85V9.27A11.23 11.23 0 0 0 26 10.5V6.75A6.77 6.77 0 0 1 20.5 2.5z" fill="#000" />
              </svg>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#121212", margin: "0 0 6px" }}>Log in to TikTok</h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Coin recharge ke liye login karo</p>
          </div>

          <ErrorBox msg={error} />

          <div style={{ marginBottom: 12 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              autoComplete="email"
              style={baseInp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ ...baseInp, paddingRight: 48 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
              <EyeIcon show={showPw} />
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 22 }}>
            <span style={{ fontSize: 13, color: "#888", cursor: "pointer" }}>Forgot password?</span>
          </div>

          <button
            onClick={handleLogin}
            disabled={!canSubmit || loading}
            style={{
              width: "100%",
              background: canSubmit ? "#fe2c55" : "#e3e3e3",
              color: canSubmit ? "#fff" : "#aaa",
              border: "none", borderRadius: 40,
              padding: "14px", fontWeight: 700, fontSize: 15,
              cursor: canSubmit && !loading ? "pointer" : "default",
              fontFamily: "inherit", marginBottom: 20,
              transition: "background .2s",
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div style={{ textAlign: "center", fontSize: 14, borderTop: "1px solid #e8e8e8", paddingTop: 18 }}>
            Account nahi hai?{" "}
            <span onClick={onGoSignup} style={{ color: "#fe2c55", fontWeight: 600, cursor: "pointer" }}>
              Sign up
            </span>
          </div>

          <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", lineHeight: 1.6, margin: "20px 0 0" }}>
            By continuing, you agree to our{" "}
            <span style={{ color: "#555", textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#555", textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── SIGNUP SCREEN ────────────────────────────────────────────────────────────

const SignupScreen = ({ onGoLogin }) => {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [pw2, setPw2]         = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !pw || !pw2) { setError("Sab fields bharo!"); return; }
    if (pw.length < 6) { setError("Password kam az kam 6 characters ka hona chahiye!"); return; }
    if (pw !== pw2) { setError("Dono passwords match nahi kar rahe!"); return; }
    setLoading(true); setError("");
    try {
      const r = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      await updateProfile(r.user, { displayName: name.trim() });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Yeh email pehle se registered hai! Login karo.");
      } else if (err.code === "auth/invalid-email") {
        setError("Email sahi format mein likho.");
      } else {
        setError("Kuch masla aa gaya: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = name.trim() && email.trim() && pw && pw2;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "0 24px", height: 60, display: "flex", alignItems: "center" }}>
        <TikTokLogo size={20} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
              <svg width="52" height="52" viewBox="0 0 28 28" fill="none">
                <path d="M20.5 2.5h-4v15.25a3.75 3.75 0 1 1-3.75-3.75c.35 0 .68.05 1 .13V9.9a8 8 0 1 0 6.75 7.85V9.27A11.23 11.23 0 0 0 26 10.5V6.75A6.77 6.77 0 0 1 20.5 2.5z" fill="#000" />
              </svg>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#121212", margin: "0 0 6px" }}>Create Account</h1>
            <p style={{ fontSize: 14, color: "#888", margin: 0 }}>TikTok coins ke liye account banao</p>
          </div>

          <ErrorBox msg={error} />

          <div style={{ marginBottom: 12 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              autoComplete="name"
              style={baseInp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              autoComplete="email"
              style={baseInp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type={showPw ? "text" : "password"}
              placeholder="Password (min 6 characters)"
              autoComplete="new-password"
              style={{ ...baseInp, paddingRight: 48 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <div onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
              <EyeIcon show={showPw} />
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              style={baseInp}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={!canSubmit || loading}
            style={{
              width: "100%",
              background: canSubmit ? "#fe2c55" : "#e3e3e3",
              color: canSubmit ? "#fff" : "#aaa",
              border: "none", borderRadius: 40,
              padding: "14px", fontWeight: 700, fontSize: 15,
              cursor: canSubmit && !loading ? "pointer" : "default",
              fontFamily: "inherit", marginBottom: 20,
              transition: "background .2s",
            }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <div style={{ textAlign: "center", fontSize: 14, borderTop: "1px solid #e8e8e8", paddingTop: 18 }}>
            Pehle se account hai?{" "}
            <span onClick={onGoLogin} style={{ color: "#fe2c55", fontWeight: 600, cursor: "pointer" }}>
              Log in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

const HomePage = ({ user, onLogout, onPayment, onInvite }) => {
  const [selected, setSelected] = useState(5);
  const [promo, setPromo]       = useState("");
  const [promoOn, setPromoOn]   = useState(false);

  const pkg   = packages.find((p) => p.id === selected);
  const price = promoOn && pkg?.price ? Math.round(pkg.price * 0.9) : pkg?.price;
  const disc  = promoOn && pkg?.price ? Math.round(pkg.price * 0.1) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif" }}>
      <TopBar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#121212", margin: "0 0 20px" }}>Get Coins</h1>

        <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, maxWidth: 340, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#fe2c55,#25f4ee)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
            {getInitial(user)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.displayName || "User"}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{user?.email || ""}</div>
          </div>
        </div>

        <div style={{ fontSize: 14, marginBottom: 16 }}>
          <span style={{ fontWeight: 600 }}>Recharge: </span>
          <span style={{ color: "#fe2c55", fontWeight: 600 }}>Save around 25% with a lower third-party service fee.</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: promoOn ? 8 : 20, maxWidth: 340 }}>
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder='Promo code (try "SAVE10")'
            style={{ flex: 1, border: "1px solid #ddd", borderRadius: 4, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit", color: "#121212", background: "#fff" }}
            onFocus={onPromoFocus}
            onBlur={onPromoBlur}
          />
          <button
            onClick={() => { if (promo.toUpperCase() === "SAVE10") setPromoOn(true); }}
            style={{ background: promoOn ? "#4caf50" : "#fe2c55", color: "#fff", border: "none", borderRadius: 4, padding: "8px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            {promoOn ? "✓ Applied" : "Apply"}
          </button>
        </div>
        {promoOn && <div style={{ color: "#4caf50", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>✓ 10% discount applied with SAVE10!</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
          {packages.map((p) => {
            const sel = selected === p.id;
            const dp  = promoOn && p.price ? Math.round(p.price * 0.9) : p.price;
            return (
              <div
                key={p.id}
                onClick={() => !p.custom && setSelected(p.id)}
                style={{ border: sel ? "2px solid #fe2c55" : "1.5px solid #e8e8e8", borderRadius: 8, padding: "16px 10px", textAlign: "center", cursor: p.custom ? "default" : "pointer", background: sel ? "#fff5f6" : "#fff", position: "relative", userSelect: "none" }}
              >
                {p.popular && (
                  <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", background: "#fe2c55", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>POPULAR</div>
                )}
                {!p.custom ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 6 }}>
                      <CoinIcon /><span style={{ fontSize: 18, fontWeight: 700 }}>{p.coins.toLocaleString()}</span>
                    </div>
                    {promoOn && <div style={{ fontSize: 11, color: "#aaa", textDecoration: "line-through" }}>PKR {p.price.toLocaleString()}</div>}
                    <div style={{ fontSize: 13, color: sel ? "#fe2c55" : "#555", fontWeight: sel ? 700 : 400 }}>{fmt(dp)}</div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 6 }}>
                      <CoinIcon /><span style={{ fontSize: 18, fontWeight: 700 }}>{p.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>{p.sub}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {price && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 480, marginBottom: 6, fontSize: 15 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700 }}>{fmt(price)}</span>
            </div>
            {promoOn && (
              <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 480, marginBottom: 14, fontSize: 12, color: "#4caf50" }}>
                <span>Discount (SAVE10 –10%)</span><span>–{fmt(disc)}</span>
              </div>
            )}
            <button
              onClick={() => onPayment(selected, price)}
              style={{ background: "#fe2c55", color: "#fff", border: "none", borderRadius: 4, padding: "13px 48px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit", maxWidth: 240, width: "100%", marginBottom: 32 }}
            >
              Recharge
            </button>
          </>
        )}

        <div
          onClick={onInvite}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "1px solid #e8e8e8", borderRadius: 8, cursor: "pointer", maxWidth: 700 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>🤝🪙</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#121212" }}>Invite &amp; Get Rewards</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>Check out this new feature!</div>
            </div>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        </div>
      </div>
    </div>
  );
};

// ─── PAYMENT PAGE ─────────────────────────────────────────────────────────────

const PaymentPage = ({ user, pkg, price, onBack, onNext, onLogout }) => {
  const [pm, setPm]         = useState("jazzcash");
  const [copied, setCopied] = useState("");
  const method = paymentMethods.find((m) => m.id === pm);

  function copy(v, k) {
    navigator.clipboard?.writeText(v).catch(() => {});
    setCopied(k);
    setTimeout(() => setCopied(""), 1800);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif" }}>
      <TopBar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: "#888" }}>
          <span style={{ color: "#fe2c55", cursor: "pointer", fontWeight: 600 }} onClick={onBack}>Get Coins</span>
          <span>›</span><span style={{ color: "#121212", fontWeight: 600 }}>Payment</span>
        </div>

        <div style={{ background: "#f8f8f8", borderRadius: 8, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CoinIcon /><CoinIcon /><CoinIcon />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{pkg?.coins?.toLocaleString()} Coins</div>
              <div style={{ fontSize: 12, color: "#888" }}>TikTok Coins</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#fe2c55" }}>{fmt(price)}</div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>Select Payment Method</h2>
        {paymentMethods.map((m) => (
          <div
            key={m.id}
            onClick={() => setPm(m.id)}
            style={{ border: pm === m.id ? "2px solid #fe2c55" : "1.5px solid #e8e8e8", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 10, background: pm === m.id ? "#fff5f6" : "#fff" }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 8, background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{m.label.slice(0, 2)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2, fontFamily: "monospace" }}>{m.acct}</div>
            </div>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: pm === m.id ? "6px solid #fe2c55" : "2px solid #ccc", flexShrink: 0 }} />
          </div>
        ))}

        <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, overflow: "hidden", margin: "20px 0" }}>
          <div style={{ background: "#f8f8f8", padding: "12px 18px", borderBottom: "1px solid #e8e8e8", fontWeight: 600, fontSize: 13, color: "#555" }}>
            Account Details — {method?.label}
          </div>
          {[
            { k: "Account Name",   v: "CoinAgency PK", key: "n" },
            { k: "Account Number", v: method?.acct,    key: "a" },
            { k: "Amount",         v: fmt(price),      key: "p", red: true },
          ].map((r) => (
            <div key={r.key} style={{ padding: "12px 18px", borderBottom: "1px solid #f1f1f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#666" }}>{r.k}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: r.red ? "#fe2c55" : "#121212" }}>{r.v}</span>
                <button
                  onClick={() => copy(r.v, r.key)}
                  style={{ fontSize: 11, padding: "3px 10px", border: "1px solid #ddd", borderRadius: 4, background: copied === r.key ? "#e8f5e9" : "#fff", color: copied === r.key ? "#4caf50" : "#555", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {copied === r.key ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#795548", marginBottom: 20 }}>
          ⚠️ Send the exact amount. Include your phone number in the payment notes.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBack} style={{ flex: 1, background: "#fff", border: "1.5px solid #ddd", borderRadius: 4, padding: "13px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
          <button onClick={() => onNext(pm)} style={{ flex: 2, background: "#fe2c55", color: "#fff", border: "none", borderRadius: 4, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>I've Sent Payment →</button>
        </div>
      </div>
    </div>
  );
};

// ─── UPLOAD PAGE ──────────────────────────────────────────────────────────────

const UploadPage = ({ user, onBack, onSubmit, onLogout }) => {
  const [uploaded, setUploaded] = useState(false);
  const [txnId, setTxnId]       = useState("");
  const [sender, setSender]     = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif" }}>
      <TopBar user={user} onLogout={onLogout} />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: "#888" }}>
          <span style={{ color: "#fe2c55", fontWeight: 600 }}>Get Coins</span><span>›</span>
          <span style={{ cursor: "pointer", color: "#888" }} onClick={onBack}>Payment</span><span>›</span>
          <span style={{ color: "#121212", fontWeight: 600 }}>Upload Proof</span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Upload Payment Proof</h2>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px" }}>Our AI will automatically verify your screenshot</p>

        <div
          onClick={() => setUploaded(true)}
          style={{ border: `2px dashed ${uploaded ? "#4caf50" : "#ddd"}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: uploaded ? "#f1f8e9" : "#fafafa", marginBottom: 20 }}
        >
          {uploaded ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, color: "#4caf50" }}>Screenshot uploaded!</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>payment_ss.jpg</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Tap to upload screenshot</div>
              <div style={{ fontSize: 12, color: "#888" }}>JPG, PNG up to 10MB</div>
            </>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Transaction ID</label>
          <input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="e.g. TXN123456789" style={uploadInpStyle} onFocus={onUploadFocus} onBlur={onUploadBlur} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Sender Phone Number</label>
          <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g. 03001234567" type="tel" style={uploadInpStyle} onFocus={onUploadFocus} onBlur={onUploadBlur} />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onBack} style={{ flex: 1, background: "#fff", border: "1.5px solid #ddd", borderRadius: 4, padding: "13px", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
          <button
            onClick={() => uploaded && onSubmit()}
            disabled={!uploaded}
            style={{ flex: 2, background: uploaded ? "#fe2c55" : "#ccc", color: "#fff", border: "none", borderRadius: 4, padding: "13px", fontWeight: 700, fontSize: 14, cursor: uploaded ? "pointer" : "not-allowed", fontFamily: "inherit" }}
          >
            Submit for Verification →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── VERIFY PAGE ──────────────────────────────────────────────────────────────

const VerifyPage = ({ user, ocrStep, onLogout }) => (
  <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif" }}>
    <TopBar user={user} onLogout={onLogout} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid #fe2c55", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", animation: "spin 1s linear infinite" }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fe2c55" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>AI Verification in Progress</h2>
      <p style={{ fontSize: 13, color: "#888", margin: "0 0 32px" }}>Analyzing screenshot with OCR…</p>
      <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "20px 24px", textAlign: "left" }}>
        {["Screenshot uploaded", "OCR text extraction", "Fraud detection", "Amount validation", "Coin credit"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid #eee" : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: ocrStep > i ? "#e8f5e9" : ocrStep === i ? "#fff5f6" : "#f1f1f1", border: `2px solid ${ocrStep > i ? "#4caf50" : ocrStep === i ? "#fe2c55" : "#ddd"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: ocrStep > i ? "#4caf50" : ocrStep === i ? "#fe2c55" : "#999" }}>
              {ocrStep > i ? "✓" : i + 1}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: ocrStep >= i ? "#121212" : "#888" }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── SUCCESS PAGE ─────────────────────────────────────────────────────────────

const SuccessPage = ({ user, pkg, price, pmLabel, onAgain, onLogout }) => (
  <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Segoe UI',Arial,sans-serif", position: "relative", overflow: "hidden" }}>
    <TopBar user={user} onLogout={onLogout} />
    <style>{`@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}@keyframes pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}</style>
    {[...Array(18)].map((_, i) => (
      <div key={i} style={{ position: "fixed", top: -20, left: `${i * 5.5 + 2}%`, width: 10, height: 10, borderRadius: i % 3 === 0 ? "50%" : "2px", background: ["#fe2c55","#25f4ee","#FFD600","#4caf50","#9c27b0"][i % 5], animation: `fall ${1.5 + i * 0.1}s ease forwards ${i * 0.08}s`, pointerEvents: "none" }} />
    ))}
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#4caf50,#81c784)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", animation: "pop .5s ease forwards" }}>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <path d="M10 26 L21 37 L40 15" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Recharge Successful!</h1>
      <p style={{ fontSize: 14, color: "#888", margin: "0 0 32px" }}>
        {pkg?.coins?.toLocaleString()} coins credited to <strong>{user?.displayName || user?.email}</strong>
      </p>
      <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
        {[
          ["Order ID",       "CA-" + Math.random().toString(36).slice(2, 8).toUpperCase()],
          ["Coins Credited", pkg?.coins?.toLocaleString() + " Coins"],
          ["Amount Paid",    fmt(price)],
          ["Payment",        pmLabel],
          ["Status",         "✓ Completed"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee", fontSize: 14 }}>
            <span style={{ color: "#888" }}>{k}</span>
            <span style={{ fontWeight: 600, color: k === "Status" ? "#4caf50" : "#121212" }}>{v}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onAgain}
        style={{ width: "100%", background: "#fe2c55", color: "#fff", border: "none", borderRadius: 4, padding: "14px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}
      >
        Recharge Again
      </button>
    </div>
  </div>
);

// ─── INVITE MODAL ─────────────────────────────────────────────────────────────

const InviteModal = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);
  const code = user ? "COIN-" + (user.uid || "").slice(0, 6).toUpperCase() : "COIN-XXXXX";

  function copyCode() {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "28px", position: "relative", fontFamily: "'Segoe UI',Arial,sans-serif" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f1f1f2", cursor: "pointer", fontSize: 18, color: "#333" }}>×</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#121212", flex: 1, paddingRight: 12 }}>
              Invite friends and get up to <span style={{ color: "#fe2c55" }}>3% cash back</span>
            </h2>
            <span style={{ fontSize: 40 }}>🤝🪙</span>
          </div>
          <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "#fafafa" }}>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Your invitation code</div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3 }}>{code}</div>
            </div>
            <button onClick={copyCode} style={{ background: copied ? "#e8f5e9" : "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "8px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer", color: copied ? "#4caf50" : "#121212", fontFamily: "inherit" }}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          {[
            { n: "1", t: "Invite your friends to recharge on CoinAgency via your unique link" },
            { n: "2", t: "Get up to 3% cash back on their Coin purchases" },
            { n: "3", t: "Cash back is added to your wallet automatically" },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#888", flexShrink: 0 }}>{s.n}</div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.5, paddingTop: 4 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]         = useState("LOGIN");
  const [user, setUser]             = useState(null);
  const [authReady, setAuthReady]   = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [ocrStep, setOcrStep]       = useState(0);
  const [selPkg, setSelPkg]         = useState(null);
  const [selPrice, setSelPrice]     = useState(null);
  const [selPm, setSelPm]           = useState("jazzcash");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        setScreen((prev) =>
          prev === "LOGIN" || prev === "SIGNUP" ? "HOME" : prev
        );
      } else {
        setScreen("LOGIN");
      }
    });
    return () => unsub();
  }, []);

  async function doLogout() {
    await signOut(auth);
  }

  function goPayment(pkgId, price) {
    setSelPkg(packages.find((p) => p.id === pkgId));
    setSelPrice(price);
    setScreen("PAYMENT");
  }

  function goUpload(pm) {
    setSelPm(pm);
    setScreen("UPLOAD");
  }

  function startOCR() {
    setScreen("VERIFY");
    setOcrStep(0);
    [1, 2, 3, 4, 5].forEach((_, i) =>
      setTimeout(() => setOcrStep(i + 1), (i + 1) * 900)
    );
    setTimeout(() => setScreen("SUCCESS"), 5400);
  }

  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#888" }}>
        <div style={{ textAlign: "center" }}>
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none" style={{ marginBottom: 12, display: "block", margin: "0 auto 12px" }}>
            <path d="M20.5 2.5h-4v15.25a3.75 3.75 0 1 1-3.75-3.75c.35 0 .68.05 1 .13V9.9a8 8 0 1 0 6.75 7.85V9.27A11.23 11.23 0 0 0 26 10.5V6.75A6.77 6.77 0 0 1 20.5 2.5z" fill="#fe2c55" />
          </svg>
          <div style={{ fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  const pmLabel = paymentMethods.find((m) => m.id === selPm)?.label || "";

  return (
    <>
      {screen === "LOGIN"   && <LoginScreen   onGoSignup={() => setScreen("SIGNUP")} />}
      {screen === "SIGNUP"  && <SignupScreen   onGoLogin={()  => setScreen("LOGIN")}  />}
      {screen === "HOME"    && <HomePage       user={user} onLogout={doLogout} onPayment={goPayment} onInvite={() => setShowInvite(true)} />}
      {screen === "PAYMENT" && <PaymentPage    user={user} pkg={selPkg} price={selPrice} onBack={() => setScreen("HOME")} onNext={goUpload} onLogout={doLogout} />}
      {screen === "UPLOAD"  && <UploadPage     user={user} onBack={() => setScreen("PAYMENT")} onSubmit={startOCR} onLogout={doLogout} />}
      {screen === "VERIFY"  && <VerifyPage     user={user} ocrStep={ocrStep} onLogout={doLogout} />}
      {screen === "SUCCESS" && <SuccessPage    user={user} pkg={selPkg} price={selPrice} pmLabel={pmLabel} onAgain={() => setScreen("HOME")} onLogout={doLogout} />}

      {showInvite && <InviteModal user={user} onClose={() => setShowInvite(false)} />}
    </>
  );
}