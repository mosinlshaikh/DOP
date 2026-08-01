import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  User,
  ArrowRight,
  Globe2,
  ShieldCheck,
  Ship,
  Package,
  Trash2,
  Plus,
  Minus,
  LayoutDashboard,
  LogOut,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Edit3,
  Fuel,
  Droplets,
  FlaskConical,
  Factory,
  FileCheck2,
  Route as RouteIcon,
} from "lucide-react";
import "./styles.css";

type Product = {
  id: number;
  name: string;
  category: string;
  grade: string;
  pack: string;
  moq: string;
  featured: boolean;
  active: boolean;
};
type UserT = { name: string; email: string; role: "customer" | "admin" };
const seed: Product[] = [
  {
    id: 1,
    name: "Ultra-Low Sulphur Diesel",
    category: "Refined Fuels",
    grade: "EN 590 / illustrative",
    pack: "Bulk vessel / flexitank",
    moq: "25 MT",
    featured: true,
    active: true,
  },
  {
    id: 2,
    name: "Industrial Hydraulic Oil",
    category: "Industrial Oils",
    grade: "ISO VG 46",
    pack: "208L drums / IBC",
    moq: "5 pallets",
    featured: true,
    active: true,
  },
  {
    id: 3,
    name: "Automotive Engine Lubricant",
    category: "Lubricants",
    grade: "SAE 15W-40",
    pack: "4L / 20L / 208L",
    moq: "1 container",
    featured: true,
    active: true,
  },
  {
    id: 4,
    name: "Base Oil Group II",
    category: "Petrochemicals",
    grade: "N150 / N500",
    pack: "Bulk / flexitank",
    moq: "20 MT",
    featured: false,
    active: true,
  },
  {
    id: 5,
    name: "Marine Gas Oil",
    category: "Refined Fuels",
    grade: "DMA reference",
    pack: "Bulk delivery",
    moq: "50 MT",
    featured: false,
    active: true,
  },
  {
    id: 6,
    name: "White Mineral Oil",
    category: "Industrial Oils",
    grade: "Technical grade",
    pack: "Drums / IBC",
    moq: "10 MT",
    featured: false,
    active: true,
  },
];
const usePersist = <T,>(key: string, initial: T) => {
  const [v, setV] = useState<T>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(v)), [key, v]);
  return [v, setV] as const;
};
const App = () => {
  const [products, setProducts] = usePersist<Product[]>("dop-products", seed);
  const [cart, setCart] = usePersist<number[]>("dop-cart", []);
  const [fav, setFav] = usePersist<number[]>("dop-fav", []);
  const [user, setUser] = usePersist<UserT | null>("dop-user", null);
  const [toast, setToast] = useState("");
  const ping = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 2600);
  };
  return (
    <HashRouter>
      <NewShell
        cart={cart.length}
        user={user}
        logout={() => {
          setUser(null);
          ping("Signed out");
        }}
      >
        {toast && (
          <div className="toast">
            <CheckCircle2 /> {toast}
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <MasterHome
                products={products}
                add={(id) => {
                  setCart([...cart, id]);
                  ping("Added to quote basket");
                }}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <Shop
                products={products}
                cart={cart}
                setCart={setCart}
                fav={fav}
                setFav={setFav}
                ping={ping}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetail
                products={products}
                add={(id) => {
                  setCart([...cart, id]);
                  ping("Added to quote basket");
                }}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <Basket
                products={products}
                cart={cart}
                setCart={setCart}
                ping={ping}
              />
            }
          />
          <Route
            path="/auth"
            element={<Auth setUser={setUser} ping={ping} />}
          />
          <Route
            path="/account"
            element={
              user ? (
                <Account user={user} />
              ) : (
                <Auth setUser={setUser} ping={ping} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <Admin
                  products={products}
                  setProducts={setProducts}
                  ping={ping}
                />
              ) : (
                <Auth setUser={setUser} ping={ping} admin />
              )
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="*"
            element={<MasterHome products={products} add={() => {}} />}
          />
        </Routes>
      </NewShell>
    </HashRouter>
  );
};
function Shell({
  children,
  cart,
  user,
  logout,
}: {
  children: React.ReactNode;
  cart: number;
  user: UserT | null;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announce">
        DUBAI, UAE · INTERNATIONAL B2B PROCUREMENT · INDICATIVE CATALOG
      </div>
      <header>
        <Link to="/" className="brand">
          <img src="assets/dop-logo.png" />
          <span>
            <b>DOP</b>
            <small>DIGITAL OIL PROPERTIES</small>
          </span>
        </Link>
        <button
          className="menu"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
          <NavLink to="/">Exchange</NavLink>
          <NavLink to="/shop">Catalog</NavLink>
          <NavLink to="/about">Company</NavLink>
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          <NavLink to={user ? "/account" : "/auth"}>
            <User /> {user ? user.name.split(" ")[0] : "Sign in"}
          </NavLink>
          <NavLink to="/cart" className="basket">
            <ShoppingBag /> Quote <i>{cart}</i>
          </NavLink>
          {user && (
            <button className="textbtn" onClick={logout}>
              <LogOut /> Exit
            </button>
          )}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <div>
          <Link to="/" className="footerbrand">
            DOP
          </Link>
          <p>
            Digital Oil Properties Global
            <br />
            Dubai, United Arab Emirates
          </p>
        </div>
        <div>
          <b>MARKETPLACE</b>
          <Link to="/shop">Product catalog</Link>
          <Link to="/cart">Request a quote</Link>
          <Link to="/account">Customer account</Link>
        </div>
        <div>
          <b>CONTACT</b>
          <a href="mailto:procurement@example.com">Procurement inquiry</a>
          <span>Illustrative demo experience</span>
          <span>No real payment capture</span>
        </div>
        <p className="legal">
          © 2026 DOP Global. Demo website — catalog, credentials and
          transactions are local illustrative data.
        </p>
      </footer>
    </>
  );
}
function NewShell({
  children,
  cart,
  user,
  logout,
}: {
  children: React.ReactNode;
  cart: number;
  user: UserT | null;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeDrawer = () => {
    setOpen(false);
    window.setTimeout(() => openerRef.current?.focus(), 0);
  };
  useLayoutEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 320);
    return () => window.clearTimeout(focusTimer);
  }, [open]);
  useEffect(() => {
    document.body.classList.toggle("drawer-open", open);
    const keys = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!drawerRef.current.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.body.classList.remove("drawer-open");
      document.removeEventListener("keydown", keys);
    };
  }, [open]);
  return (
    <>
      <header className="masthead">
        <Link to="/" className="glassMark" aria-label="DOP home">
          <img src="assets/dop-logo-transparent.png" alt="DOP" />
        </Link>
        <div className="mastIdentity">
          <b>DIGITAL OIL PROPERTIES GLOBAL</b>
          <span>DUBAI · UNITED ARAB EMIRATES</span>
        </div>
        <button
          ref={openerRef}
          className="menuButton"
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="dop-navigation-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu />
          <span>MENU</span>
        </button>
      </header>
      <MarketPulse />
      <div
        className={open ? "drawerLayer open" : "drawerLayer"}
        aria-hidden={!open}
        onMouseDown={(e) => e.target === e.currentTarget && closeDrawer()}
      >
        <aside
          ref={drawerRef}
          id="dop-navigation-drawer"
          className="navDrawer"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
        >
          <div className="drawerTop">
            <img src="assets/dop-logo-transparent.png" alt="" />
            <button
              ref={closeRef}
              aria-label="Close navigation"
              onClick={closeDrawer}
            >
              <X />
            </button>
          </div>
          <p>GLOBAL ENERGY PROCUREMENT</p>
          <nav onClick={closeDrawer}>
            <NavLink to="/">
              Home <span>01</span>
            </NavLink>
            <NavLink to="/">
              Market <span>02</span>
            </NavLink>
            <NavLink to="/shop">
              Catalog <span>03</span>
            </NavLink>
            <NavLink to="/about">
              Company <span>04</span>
            </NavLink>
            <NavLink to={user ? "/account" : "/auth"}>
              {user ? "Account" : "Sign in"} <span>05</span>
            </NavLink>
            <NavLink to="/cart">
              Quote Basket ({cart}) <span>06</span>
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin">
                Admin <span>07</span>
              </NavLink>
            )}
          </nav>
          {user && (
            <button
              className="drawerLogout"
              onClick={() => {
                logout();
                closeDrawer();
              }}
            >
              <LogOut /> Sign out
            </button>
          )}
        </aside>
      </div>
      <main>{children}</main>
      <footer>
        <div>
          <Link to="/" className="footerbrand">
            DOP
          </Link>
          <p>
            Digital Oil Properties Global
            <br />
            Dubai, United Arab Emirates
          </p>
        </div>
        <div>
          <b>MARKETPLACE</b>
          <Link to="/shop">Product catalog</Link>
          <Link to="/cart">Request a quote</Link>
          <Link to="/account">Customer account</Link>
        </div>
        <div>
          <b>CONTACT</b>
          <span>Business contact details pending verification</span>
          <span>Illustrative demo experience</span>
          <span>No real payment capture</span>
        </div>
        <p className="legal">
          © 2026 DOP Global. Demonstration website — catalog, credentials,
          availability and transactions are illustrative local data. Market
          information may be delayed and is provided by TradingView.
        </p>
      </footer>
    </>
  );
}
function MarketPulse() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [adapterQuotes, setAdapterQuotes] = useState<
    Array<{ symbol: string; price: string; change?: string }> | null
  >(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1800);
    fetch("/api/market", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok || !r.headers.get("content-type")?.includes("json"))
          throw new Error("No secure market adapter");
        return r.json();
      })
      .then((data) => {
        const quotes = Array.isArray(data?.quotes) ? data.quotes : [];
        const allowed = new Set(["USOIL", "UKOIL", "XNGUSD", "ULSD"]);
        const safe = quotes
          .filter(
            (q: { symbol?: string; price?: string | number }) =>
              q?.symbol && allowed.has(q.symbol) && q.price !== undefined,
          )
          .map((q: { symbol: string; price: string | number; change?: string }) => ({
            symbol: q.symbol,
            price: String(q.price),
            change: q.change ? String(q.change) : undefined,
          }));
        if (safe.length >= 3) setAdapterQuotes(safe);
        else throw new Error("Incomplete adapter response");
      })
      .catch(() => {
        if (!widgetRef.current) return;
        const script = document.createElement("script");
        script.src =
          "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.async = true;
        script.text = JSON.stringify({
          symbols: [
            { proName: "TVC:USOIL", title: "WTI Crude" },
            { proName: "TVC:UKOIL", title: "Brent Crude" },
            { proName: "NYMEX:NG1!", title: "Natural Gas" },
            { proName: "NYMEX:HO1!", title: "ULSD / Heating Oil" },
          ],
          showSymbolLogo: false,
          colorTheme: "dark",
          isTransparent: true,
          displayMode: "adaptive",
          locale: "en",
        });
        script.onerror = () => setUnavailable(true);
        widgetRef.current.appendChild(script);
        window.setTimeout(() => {
          if (!widgetRef.current?.querySelector("iframe")) setUnavailable(true);
        }, 8000);
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);
  return (
    <section className="marketPulse" aria-label="Energy market pulse">
      <div className="pulseLabel">
        <i />
        <span>MARKET PULSE</span>
        <small>DATA MAY BE DELAYED</small>
      </div>
      <div className="tickerViewport">
        {adapterQuotes ? (
          <div className="adapterQuotes">
            {adapterQuotes.map((q) => (
              <span key={q.symbol}>
                <b>{q.symbol}</b> {q.price} <i>{q.change}</i>
              </span>
            ))}
          </div>
        ) : unavailable ? (
          <p>Market data unavailable</p>
        ) : (
          <div
            ref={widgetRef}
            className="tradingview-widget-container"
            aria-label="Oil and energy market ticker"
          />
        )}
      </div>
      <a
        href="https://www.tradingview.com/markets/commodities/"
        target="_blank"
        rel="noreferrer"
      >
        Market charts by TradingView
      </a>
    </section>
  );
}
const categories = [
  "Refined Fuels",
  "Lubricants",
  "Petrochemicals",
  "Industrial Oils",
];
const categoryIcons = [Fuel, Droplets, FlaskConical, Factory];
function MasterHome({
  products,
  add,
}: {
  products: Product[];
  add: (id: number) => void;
}) {
  const nav = useNavigate();
  const [term, setTerm] = useState("");
  const [destination, setDestination] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/shop${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  };
  return (
    <>
      <section className="masterHero">
        <div className="heroAtmosphere">
          <img
            className="terminalArt"
            src="assets/dop-energy-terminal-hero.png"
            alt="Cinematic oil terminal, tanker and Dubai energy logistics environment"
            fetchPriority="high"
          />
        </div>
        <div className="masterCopy">
          <p className="kicker">DUBAI-BASED · GLOBAL B2B PROCUREMENT</p>
          <h1>
            Energy products.
            <br />
            <em>Precisely sourced.</em>
          </h1>
          <p>
            Structured procurement for bulk fuels, lubricants, petrochemicals
            and industrial oils—built for qualified buyers, clear specifications
            and considered logistics.
          </p>
          <div className="actions">
            <Link className="primary" to="/cart">
              Build an RFQ <ArrowRight />
            </Link>
            <Link className="secondary" to="/shop">
              Explore products
            </Link>
          </div>
          <ul>
            <li>
              <ShieldCheck /> Qualification-first inquiry
            </li>
            <li>
              <Ship /> Destination-led logistics
            </li>
          </ul>
        </div>
        <span className="heroIndex">DOP / 01</span>
      </section>
      <section className="commandDeck">
        <div>
          <p className="kicker">PROCUREMENT COMMAND</p>
          <h2>Start with the requirement.</h2>
        </div>
        <form onSubmit={submit}>
          <label>
            <Search />
            <span>PRODUCT OR GRADE</span>
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. EN 590 diesel"
            />
          </label>
          <label>
            <MapPin />
            <span>DESTINATION</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Port or country"
            />
          </label>
          <button className="primary">
            Search catalog <ArrowRight />
          </button>
        </form>
        <small>
          Indicative catalog only. Availability and commercial terms require
          review.
        </small>
      </section>
      <section className="masterSection categoriesMaster">
        <div className="masterHeading">
          <p className="kicker">CORE SUPPLY CATEGORIES</p>
          <h2>
            Four routes into
            <br />
            industrial energy.
          </h2>
        </div>
        <div className="categoryStack">
          {categories.map((c, i) => {
            const Icon = categoryIcons[i];
            return (
              <Link to={`/shop?cat=${encodeURIComponent(c)}`} key={c}>
                <span>0{i + 1}</span>
                <Icon />
                <div>
                  <h3>{c}</h3>
                  <p>
                    {
                      [
                        "Bulk diesel, marine fuels and supply-led inquiries.",
                        "Automotive and industrial lubrication programs.",
                        "Base oils and selected downstream product inquiries.",
                        "Hydraulic, mineral and application-specific oils.",
                      ][i]
                    }
                  </p>
                </div>
                <ArrowRight />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="masterSection focusSection">
        <div className="masterHeading row">
          <div>
            <p className="kicker">PRODUCTS IN FOCUS</p>
            <h2>
              Different products.
              <br />
              Different logistics.
            </h2>
          </div>
          <Link to="/shop">
            VIEW FULL CATALOG <ArrowRight />
          </Link>
        </div>
        <div className="products masterProducts">
          {products
            .filter((p) => p.featured && p.active)
            .map((p, i) => (
              <ProductCard key={p.id} p={p} add={add} visual={i} />
            ))}
        </div>
      </section>
      <section className="packagingStory">
        <div className="packagingArt">
          <img
            src="assets/dop-global-packaging.png"
            alt="Black bulk drum, blue lubricant drum, IBC container and packaged lubricant canister at a refinery"
            loading="lazy"
          />
        </div>
        <div className="packagingCopy">
          <p className="kicker">PRODUCT / PACKAGING / ROUTE</p>
          <h2>One category does not mean one supply format.</h2>
          <p>
            Bulk vessel, flexitank, IBC, drum and packaged programs each create
            different quantity, handling and destination conversations. Final
            formats remain subject to product and supplier review.
          </p>
          <Link className="secondary" to="/shop">
            Compare catalog formats <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="distillationSection">
        <div className="distillationIntro">
          <p className="kicker">FROM CRUDE TO FRACTIONS</p>
          <h2>A clearer view of the barrel.</h2>
          <p>
            Fractional distillation separates crude-oil components by boiling
            range. The simplified ranges below are educational references;
            actual refinery cuts vary by crude slate and operating conditions.
          </p>
        </div>
        <div className="distillationGlass">
          <img
            src="assets/dop-distillation-glass.png"
            alt="Glass fractional distillation column visualization"
            loading="lazy"
          />
          <div className="fractionLabels" aria-label="Indicative crude oil fractions">
            <span style={{ top: "8%" }}><b>Refinery gases</b><small>below ~20°C</small></span>
            <span style={{ top: "23%" }}><b>Gasoline / naphtha</b><small>~40–200°C</small></span>
            <span style={{ top: "40%" }}><b>Kerosene / jet range</b><small>~150–275°C</small></span>
            <span style={{ top: "57%" }}><b>Diesel / gasoil</b><small>~250–350°C</small></span>
            <span style={{ top: "73%" }}><b>Lubricating oils & waxes</b><small>~300–400°C</small></span>
            <span style={{ top: "88%" }}><b>Heavy residue / bitumen</b><small>typically above ~350°C</small></span>
          </div>
        </div>
      </section>
      <section className="framework">
        <div>
          <p className="kicker">COMMERCIAL FRAMEWORK</p>
          <h2>Clarity before commitment.</h2>
          <p>
            Every inquiry progresses through a transparent qualification path.
            We do not present unverified stock, documentation or commercial
            readiness.
          </p>
        </div>
        <ol>
          {[
            [
              FileCheck2,
              "Specification review",
              "Product, grade, quantity and packaging.",
            ],
            [
              ShieldCheck,
              "Compliance documents",
              "Requested documentation reviewed case by case.",
            ],
            [
              User,
              "Commercial qualification",
              "Buyer and requirement suitability assessed.",
            ],
            [
              RouteIcon,
              "Logistics discussion",
              "Destination, incoterm and route considered.",
            ],
          ].map(([I, t, d], i) => {
            const Icon = I as typeof FileCheck2;
            return (
              <li key={t as string}>
                <span>0{i + 1}</span>
                <Icon />
                <div>
                  <b>{t as string}</b>
                  <p>{d as string}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <section className="dubaiBridge">
        <div className="routeVisual">
          <span>DUBAI</span>
          <i />
          <span>GLOBAL DESTINATIONS</span>
          <Ship />
        </div>
        <div>
          <p className="kicker">DUBAI / GLOBAL</p>
          <h2>
            A commercial bridge,
            <br />
            not a promise.
          </h2>
          <p>
            Dubai provides the operating context for international procurement
            conversations—connecting product requirements, documentary review
            and destination-led logistics planning.
          </p>
          <Link className="secondary" to="/about">
            Our operating approach <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="finalRfq">
        <p className="kicker">READY TO DEFINE YOUR REQUIREMENT?</p>
        <h2>
          Build a procurement request
          <br />
          with commercial precision.
        </h2>
        <Link className="primary" to="/cart">
          Build an RFQ <ArrowRight />
        </Link>
      </section>
    </>
  );
}
function Home({
  products,
  add,
}: {
  products: Product[];
  add: (id: number) => void;
}) {
  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">DUBAI MIDNIGHT ENERGY EXCHANGE</p>
          <h1>
            Energy trade,
            <br />
            <em>engineered globally.</em>
          </h1>
          <p className="lead">
            A refined procurement gateway for industrial fuels, lubricants and
            energy products — connecting qualified buyers with structured
            inquiry workflows.
          </p>
          <div className="actions">
            <Link className="primary" to="/shop">
              Explore catalog <ArrowRight />
            </Link>
            <Link className="secondary" to="/cart">
              Start an RFQ
            </Link>
          </div>
          <div className="heroMeta">
            <span>
              <Globe2 /> Global sourcing scope
            </span>
            <span>
              <ShieldCheck /> Qualification-first
            </span>
          </div>
        </div>
        <OilGlobe />
      </section>
      <section className="value">
        <span>
          01 <b>Dubai based</b>
          <small>International commercial hub</small>
        </span>
        <span>
          02 <b>Structured RFQs</b>
          <small>Clear specifications & terms</small>
        </span>
        <span>
          03 <b>Global logistics</b>
          <small>Incoterm-led discussions</small>
        </span>
        <span>
          04 <b>B2B focus</b>
          <small>Qualified trade inquiries</small>
        </span>
      </section>
      <section className="section">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">THE CATALOG</p>
            <h2>Built for industrial demand.</h2>
          </div>
          <Link to="/shop">
            View all products <ArrowRight />
          </Link>
        </div>
        <div className="categoryRail">
          {categories.map((c, i) => (
            <Link to={"/shop?cat=" + c} key={c} className="cat">
              <span>0{i + 1}</span>
              <Package />
              <h3>{c}</h3>
              <p>
                Request specifications, packaging and indicative commercial
                terms.
              </p>
              <ChevronRight />
            </Link>
          ))}
        </div>
      </section>
      <section className="section dark">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">FEATURED INQUIRIES</p>
            <h2>Products in focus.</h2>
          </div>
        </div>
        <div className="products">
          {products
            .filter((p) => p.featured && p.active)
            .map((p) => (
              <ProductCard key={p.id} p={p} add={add} />
            ))}
        </div>
      </section>
      <section className="journey">
        <div>
          <p className="eyebrow">PROCUREMENT JOURNEY</p>
          <h2>
            From requirement
            <br />
            to routed inquiry.
          </h2>
        </div>
        <ol>
          <li>
            <b>Define</b>
            <span>Choose product, grade and packaging.</span>
          </li>
          <li>
            <b>Configure</b>
            <span>Add quantity, destination and incoterm.</span>
          </li>
          <li>
            <b>Submit</b>
            <span>Send a structured demo RFQ for review.</span>
          </li>
        </ol>
      </section>
      <section className="logistics">
        <div className="maporb">
          <Globe2 />
        </div>
        <div>
          <p className="eyebrow">DUBAI / GLOBAL</p>
          <h2>A strategic bridge for energy commerce.</h2>
          <p>
            Designed around international procurement conversations, documentary
            clarity and logistics planning — without presenting unverified
            availability or live prices.
          </p>
          <Link className="primary" to="/about">
            Company & inquiry <ArrowRight />
          </Link>
        </div>
      </section>
      <section className="rfq">
        <p className="eyebrow">READY TO SPECIFY?</p>
        <h2>Build a precise procurement request.</h2>
        <Link className="primary" to="/shop">
          Open the exchange <ArrowRight />
        </Link>
      </section>
    </>
  );
}
function OilGlobe() {
  const [r, setR] = useState({ x: 0, y: 0 });
  return (
    <div
      className="orbStage"
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        setR({
          x: (e.clientX - b.left - b.width / 2) / 35,
          y: (e.clientY - b.top - b.height / 2) / 35,
        });
      }}
    >
      <div
        className="rings"
        style={{ transform: `rotateX(${r.y}deg) rotateY(${r.x}deg)` }}
      >
        <div className="globe">
          <div className="gridlines" />
          <Globe2 className="world" />
          <div className="drop" />
        </div>
      </div>
      <span className="orbitText">
        DIGITAL OIL · PROPERTIES GLOBAL · DUBAI ·
      </span>
    </div>
  );
}
function ProductCard({
  p,
  add,
  fav,
  toggle,
  visual = 0,
}: {
  p: Product;
  add: (id: number) => void;
  fav?: boolean;
  toggle?: () => void;
  visual?: number;
}) {
  return (
    <article className="product">
      <div className={`productVisual visual-${visual}`}>
        <span>{p.category}</span>
        <div
          className={
            visual === 1 ? "ibc" : visual === 2 ? "packaged" : "barrel"
          }
        >
          <div />
        </div>
        {toggle && (
          <button
            aria-label="Save"
            className={fav ? "saved" : ""}
            onClick={toggle}
          >
            <Heart />
          </button>
        )}
      </div>
      <div className="productBody">
        <small>{p.grade}</small>
        <h3>
          <Link to={`/product/${p.id}`}>{p.name}</Link>
        </h3>
        <dl>
          <div>
            <dt>PACKAGING</dt>
            <dd>{p.pack}</dd>
          </div>
          <div>
            <dt>MIN. ORDER</dt>
            <dd>{p.moq}</dd>
          </div>
        </dl>
        <div className="productActions">
          <Link to={`/product/${p.id}`}>View specs</Link>
          <button onClick={() => add(p.id)}>
            Add to quote <Plus />
          </button>
        </div>
      </div>
    </article>
  );
}
function Shop({
  products,
  cart,
  setCart,
  fav,
  setFav,
  ping,
}: {
  products: Product[];
  cart: number[];
  setCart: (x: number[]) => void;
  fav: number[];
  setFav: (x: number[]) => void;
  ping: (s: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = products.filter(
    (p) =>
      p.active &&
      (cat === "All" || p.category === cat) &&
      p.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <section className="page">
      <div className="pageTitle">
        <p className="eyebrow">INDICATIVE B2B CATALOG</p>
        <h1>Product exchange.</h1>
        <p>
          No real-time pricing. Submit specifications to request an indicative
          quote.
        </p>
      </div>
      <div className="toolbar">
        <label>
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products or grade"
          />
        </label>
        <div>
          {["All", ...categories].map((c) => (
            <button
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {list.length ? (
        <div className="products catalog">
          {list.map((p) => (
            <ProductCard
              p={p}
              key={p.id}
              fav={fav.includes(p.id)}
              toggle={() =>
                setFav(
                  fav.includes(p.id)
                    ? fav.filter((x) => x !== p.id)
                    : [...fav, p.id],
                )
              }
              add={(id) => {
                setCart([...cart, id]);
                ping("Added to quote basket");
              }}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Search />
          <h3>No matching products</h3>
          <p>Clear the search or choose another category.</p>
        </div>
      )}
    </section>
  );
}
function ProductDetail({
  products,
  add,
}: {
  products: Product[];
  add: (id: number) => void;
}) {
  const { id } = useParams();
  const p = products.find((x) => x.id === Number(id)) || products[0];
  const [qty, setQty] = useState(25);
  return (
    <section className="detail page">
      <div className="detailVisual">
        <div className="barrel big">
          <div />
        </div>
        <span>INDICATIVE PRODUCT VIEW</span>
      </div>
      <div>
        <p className="eyebrow">{p.category}</p>
        <h1>{p.name}</h1>
        <p className="lead">
          Structured for commercial inquiry. Final grade, origin, documentation,
          availability and terms require review.
        </p>
        <div className="specs">
          <div>
            <small>REFERENCE GRADE</small>
            <b>{p.grade}</b>
          </div>
          <div>
            <small>PACKAGING</small>
            <b>{p.pack}</b>
          </div>
          <div>
            <small>MINIMUM ORDER</small>
            <b>{p.moq}</b>
          </div>
        </div>
        <label className="field">
          INCOTERM
          <select>
            <option>FOB — Port of loading</option>
            <option>CIF — Named destination port</option>
            <option>EXW — Supplier facility</option>
          </select>
        </label>
        <label className="field">
          INDICATIVE QUANTITY (MT)
          <div className="stepper">
            <button onClick={() => setQty(Math.max(1, qty - 5))}>
              <Minus />
            </button>
            <input
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <button onClick={() => setQty(qty + 5)}>
              <Plus />
            </button>
          </div>
        </label>
        <button className="primary wide" onClick={() => add(p.id)}>
          Add to quote basket <ShoppingBag />
        </button>
        <p className="notice">
          This demo does not confirm stock, price, certification, or contractual
          supply.
        </p>
      </div>
    </section>
  );
}
function Basket({
  products,
  cart,
  setCart,
  ping,
}: {
  products: Product[];
  cart: number[];
  setCart: (x: number[]) => void;
  ping: (s: string) => void;
}) {
  const nav = useNavigate();
  const items = cart
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    company: "",
    email: "",
    country: "",
    message: "",
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.email || !form.country) {
      ping("Please complete required fields");
      return;
    }
    setStep(1);
    setCart([]);
  };
  if (step)
    return (
      <section className="page confirmation">
        <CheckCircle2 />
        <p className="eyebrow">DEMO RFQ RECEIVED</p>
        <h1>Your inquiry is staged.</h1>
        <p>
          Reference DOP-DEMO-{String(Date.now()).slice(-6)}. No message was sent
          and no order was placed.
        </p>
        <button className="primary" onClick={() => nav("/account")}>
          View account
        </button>
      </section>
    );
  return (
    <section className="page">
      <div className="pageTitle">
        <p className="eyebrow">QUOTE BASKET</p>
        <h1>Configure your inquiry.</h1>
      </div>
      {!items.length ? (
        <div className="empty">
          <ShoppingBag />
          <h3>Your quote basket is empty</h3>
          <p>Add products from the catalog to begin.</p>
          <Link className="primary" to="/shop">
            Browse catalog
          </Link>
        </div>
      ) : (
        <div className="checkout">
          <div className="basketList">
            {items.map((p, i) => (
              <article>
                <span>0{i + 1}</span>
                <div>
                  <small>{p.category}</small>
                  <h3>{p.name}</h3>
                  <p>
                    {p.grade} · {p.pack}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const copy = [...cart];
                    copy.splice(i, 1);
                    setCart(copy);
                  }}
                >
                  <Trash2 />
                </button>
              </article>
            ))}
          </div>
          <form onSubmit={submit}>
            <h2>Procurement details</h2>
            <label className="field">
              COMPANY *
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </label>
            <label className="field">
              BUSINESS EMAIL *
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="field">
              DESTINATION COUNTRY *
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </label>
            <label className="field">
              REQUIREMENTS
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            <button className="primary wide">
              Submit demo RFQ <ArrowRight />
            </button>
            <p className="notice">
              Local demo only. No payment or external transmission occurs.
            </p>
          </form>
        </div>
      )}
    </section>
  );
}
function Auth({
  setUser,
  ping,
  admin = false,
}: {
  setUser: (u: UserT) => void;
  ping: (s: string) => void;
  admin?: boolean;
}) {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({
    name: "",
    email: admin ? "admin@dop.demo" : "buyer@dop.demo",
    password: "Demo123!",
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 8 || !f.email.includes("@")) {
      ping("Use a valid email and 8+ character password");
      return;
    }
    const role =
      f.email.toLowerCase() === "admin@dop.demo" ? "admin" : "customer";
    setUser({
      name: f.name || (role === "admin" ? "DOP Admin" : "Demo Buyer"),
      email: f.email,
      role,
    });
    ping("Demo session started");
    nav(role === "admin" ? "/admin" : "/account");
  };
  return (
    <section className="auth">
      <div className="authArt">
        <img src="assets/dop-logo.png" />
        <h2>
          Trade access,
          <br />
          <em>refined.</em>
        </h2>
        <p>
          Local demonstration authentication for exploring customer and admin
          workflows.
        </p>
      </div>
      <form onSubmit={submit}>
        <p className="eyebrow">{admin ? "ADMIN ACCESS" : "MEMBER EXCHANGE"}</p>
        <h1>{mode === "login" ? "Welcome back." : "Create your profile."}</h1>
        {mode === "register" && (
          <label className="field">
            FULL NAME
            <input
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </label>
        )}
        <label className="field">
          EMAIL
          <input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
        </label>
        <label className="field">
          PASSWORD
          <input
            type="password"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
          />
        </label>
        <button className="primary wide">
          {mode === "login" ? "Sign in" : "Register locally"} <ArrowRight />
        </button>
        <button
          type="button"
          className="switch"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "New buyer? Create an account"
            : "Already registered? Sign in"}
        </button>
        <div className="demo">
          <b>Demo accounts</b>
          <span>Customer: buyer@dop.demo / Demo123!</span>
          <span>Admin: admin@dop.demo / Demo123!</span>
          <small>
            Credentials are illustrative and not production security.
          </small>
        </div>
      </form>
    </section>
  );
}
function Account({ user }: { user: UserT }) {
  return (
    <section className="page">
      <div className="pageTitle">
        <p className="eyebrow">CUSTOMER DESK</p>
        <h1>Good evening, {user.name.split(" ")[0]}.</h1>
        <p>Local demo account · {user.email}</p>
      </div>
      <div className="accountGrid">
        <article className="profile">
          <User />
          <h3>Profile status</h3>
          <b>Demo buyer profile</b>
          <p>
            Company verification and profile editing require the production
            backend.
          </p>
          <button className="secondary" disabled aria-disabled="true">
            Demo preview — editing unavailable
          </button>
        </article>
        <article className="history">
          <h2>Quote history</h2>
          <div>
            <span>DOP-DEMO-2416</span>
            <b>3 products</b>
            <small>Illustrative · Under review</small>
          </div>
          <div>
            <span>DOP-DEMO-1907</span>
            <b>1 product</b>
            <small>Illustrative · Draft</small>
          </div>
        </article>
        <article>
          <h2>Saved items</h2>
          <p>Your locally saved catalog items remain in this browser.</p>
          <Link to="/shop">
            Open catalog <ArrowRight />
          </Link>
        </article>
        <article>
          <h2>Delivery addresses</h2>
          <MapPin />
          <p>Address management is a production-only preview.</p>
          <button className="secondary" disabled aria-disabled="true">
            Demo preview — unavailable
          </button>
        </article>
      </div>
    </section>
  );
}
function Admin({
  products,
  setProducts,
  ping,
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
  ping: (s: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [rfq, setRfq] = useState([
    "Under review",
    "New",
    "Needs specification",
  ]);
  const [stock, setStock] = useState([72, 38, 14]);
  const nav = ["Overview", "Products", "Quotes", "Customers", "Inventory"];
  const save = (id: number) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, name: draft } : p)));
    setEditing(null);
    ping("Catalog updated locally");
  };
  const demoRows =
    tab === "Customers"
      ? [
          ["Meridian Industrial LLC", "UAE", "Qualified demo"],
          ["Nexus Trade FZE", "Singapore", "Review pending"],
          ["Atlas Equipment Co.", "Kenya", "Qualified demo"],
        ]
      : [];
  return (
    <section className="admin">
      <aside>
        <b>DOP / CONTROL</b>
        {nav.map((n) => (
          <button
            key={n}
            className={tab === n ? "active" : ""}
            onClick={() => setTab(n)}
          >
            <LayoutDashboard />
            {n}
          </button>
        ))}
      </aside>
      <div className="adminMain">
        <div className="adminHead">
          <div>
            <p className="eyebrow">LOCAL DEMO CONTROL PANEL</p>
            <h1>{tab}</h1>
          </div>
          <span>Admin demo role</span>
        </div>
        {tab === "Overview" && (
          <>
            <div className="metrics">
              <article>
                <small>ACTIVE CATALOG</small>
                <b>{products.filter((p) => p.active).length}</b>
                <span>local products</span>
              </article>
              <article>
                <small>OPEN RFQs</small>
                <b>08</b>
                <span>illustrative</span>
              </article>
              <article>
                <small>BUYER PROFILES</small>
                <b>24</b>
                <span>illustrative</span>
              </article>
              <article>
                <small>REVIEW FLAGS</small>
                <b>03</b>
                <span>needs attention</span>
              </article>
            </div>
            <div className="adminTable">
              <h2>Recent quote activity</h2>
              {["DOP-DEMO-2416", "DOP-DEMO-2409", "DOP-DEMO-2388"].map(
                (x, i) => (
                  <div key={x}>
                    <span>{x}</span>
                    <b>
                      {
                        [
                          "Meridian Industrial LLC",
                          "Nexus Trade FZE",
                          "Atlas Equipment Co.",
                        ][i]
                      }
                    </b>
                    <small>{rfq[i]}</small>
                  </div>
                ),
              )}
            </div>
          </>
        )}
        {tab === "Products" && (
          <div className="adminTable">
            <div className="tableTitle">
              <h2>Local catalog management</h2>
              <button
                className="primary"
                onClick={() => {
                  const id = Date.now();
                  setProducts([
                    ...products,
                    {
                      id,
                      name: "New energy product",
                      category: "Industrial Oils",
                      grade: "Draft grade",
                      pack: "TBD",
                      moq: "TBD",
                      featured: false,
                      active: false,
                    },
                  ]);
                  ping("Draft product added");
                }}
              >
                <Plus /> Add product
              </button>
            </div>
            {products.map((p) => (
              <div className="productRow" key={p.id}>
                <span>#{p.id}</span>
                {editing === p.id ? (
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => save(p.id)}
                    autoFocus
                  />
                ) : (
                  <b>{p.name}</b>
                )}
                <small>{p.category}</small>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={() => {
                      setProducts(
                        products.map((x) =>
                          x.id === p.id ? { ...x, active: !x.active } : x,
                        ),
                      );
                      ping("Availability toggled");
                    }}
                  />
                  <i />
                </label>
                <button
                  aria-label={`Edit ${p.name}`}
                  onClick={() => {
                    setEditing(p.id);
                    setDraft(p.name);
                  }}
                >
                  <Edit3 />
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "Quotes" && (
          <div className="adminTable">
            <h2>Seeded quote workflow</h2>
            {["DOP-DEMO-2416", "DOP-DEMO-2409", "DOP-DEMO-2388"].map((x, i) => (
              <div key={x}>
                <span>{x}</span>
                <b>{rfq[i]}</b>
                <button
                  onClick={() => {
                    const n = [...rfq];
                    n[i] = n[i] === "Reviewed" ? "Under review" : "Reviewed";
                    setRfq(n);
                    ping("Quote status changed locally");
                  }}
                >
                  Mark {rfq[i] === "Reviewed" ? "open" : "reviewed"}
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "Customers" && (
          <div className="adminTable">
            <h2>Illustrative customer directory</h2>
            {demoRows.map((r) => (
              <div key={r[0]}>
                <b>{r[0]}</b>
                <span>{r[1]}</span>
                <small>{r[2]}</small>
              </div>
            ))}
          </div>
        )}
        {tab === "Inventory" && (
          <div className="adminTable">
            <h2>Local inventory indicators</h2>
            {[
              "ULSD allocation",
              "Hydraulic oil drums",
              "Base oil flexitanks",
            ].map((x, i) => (
              <div key={x}>
                <b>{x}</b>
                <span>{stock[i]}% indicative</span>
                <button
                  onClick={() => {
                    const n = [...stock];
                    n[i] = Math.max(0, n[i] - 5);
                    setStock(n);
                    ping("Indicator adjusted locally");
                  }}
                >
                  Adjust −5%
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
function About() {
  return (
    <section className="page about">
      <div className="pageTitle">
        <p className="eyebrow">DUBAI, UNITED ARAB EMIRATES</p>
        <h1>
          Connections energized.
          <br />
          <em>Value delivered responsibly.</em>
        </h1>
      </div>
      <div className="aboutGrid">
        <article>
          <h2>Our positioning</h2>
          <p>
            Digital Oil Properties Global is presented here as a B2B energy
            procurement marketplace concept. This demonstration focuses on clear
            product requirements, structured inquiries and global logistics
            conversations.
          </p>
        </article>
        <article>
          <Ship />
          <h3>Trade corridors</h3>
          <p>Destination, incoterm and packaging-led sourcing discussions.</p>
        </article>
        <article>
          <ShieldCheck />
          <h3>Commercial clarity</h3>
          <p>
            No unsupported certifications, guarantees or fabricated live market
            data.
          </p>
        </article>
        <article className="contact">
          <h2>Start a procurement inquiry</h2>
          <p>
            <Mail /> procurement@example.com
          </p>
          <p>
            <Phone /> +971 — demo contact
          </p>
          <p>
            <MapPin /> Dubai, UAE
          </p>
          <Link className="primary" to="/cart">
            Build RFQ <ArrowRight />
          </Link>
        </article>
      </div>
    </section>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
