// src/pages/dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSearchLine,
  RiNotification3Line,
  RiUser3Line,
  RiHome2Line,
  RiLogoutBoxRLine,
  RiBankLine,
  RiMoneyDollarCircleLine,
  RiFileListLine,
  RiShieldCheckLine,
  RiBankCardLine,
  RiHandCoinLine,
  RiShoppingCartLine,
  RiTrainLine,
} from "react-icons/ri";
import HDFCLogo from "../assets/hdfc.png"; // ensure this exists

// helper: mask account number (show last 4 only)
const maskAccount = (acct) => {
  if (!acct) return "XXXX-XXXX-XXXX";
  const s = String(acct).replace(/\s+/g, "");
  return `XXXX-XXXX-${s.slice(-4)}`;
};

// try parse JSON safely
const parseMaybeJson = (v) => {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

// read value from many possible localStorage keys
const readProfileField = (field) => {
  // candidate keys for each field
  const keyCandidates = {
    name: ["userName", "kycName", "kycPersonal", "profileName"],
    email: ["userEmail", "kycEmail", "email", "kycPersonal"],
    mobile: ["userMobile", "kycMobile", "mobile", "kycPersonal"],
    kycId: ["userKycId", "kycId", "kycCompleteResponse"],
    accountNo: ["userAccountNo", "accountNo", "kycCompleteResponse"],
    kycStatus: ["userKycStatus", "kycStatus", "kycCompleteResponse"],
    balance: ["userBalance"],
  };

  // choose candidate list
  const keys = keyCandidates[field] || [];

  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (!v) continue;
    // if key likely contains JSON (kycPersonal, kycCompleteResponse)
    if (k.toLowerCase().includes("kyc") || v.trim().startsWith("{")) {
      const parsed = parseMaybeJson(v);
      if (parsed) {
        // try common property names
        const lookupNames = {
          name: ["fullName", "name", "userName"],
          email: ["email", "userEmail"],
          mobile: ["mobile", "phone", "userMobile"],
          kycId: ["kycId", "id"],
          accountNo: ["accountNo", "acc", "account"],
          kycStatus: ["status", "kycStatus"],
          balance: ["balance"],
        }[field];

        if (lookupNames) {
          for (const ln of lookupNames) {
            if (parsed[ln]) return parsed[ln];
          }
        }

        // fallback: if field exists directly
        if (parsed[field]) return parsed[field];
      }
    } else {
      // plain value
      return v;
    }
  }

  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "Customer",
    email: "—",
    mobile: "—",
    kycId: "N/A",
    accountNo: "Not assigned",
    kycStatus: "Completed",
    balance: null,
  });

  useEffect(() => {
    // read fields using robust reader
    const name = readProfileField("name") || "Customer";
    const email = readProfileField("email") || "—";
    const mobile = readProfileField("mobile") || "—";
    const kycId = readProfileField("kycId") || "N/A";
    const accountNo = readProfileField("accountNo") || "Not assigned";
    // force KYC status to Completed if present otherwise default "Completed"
    const kycStatus = readProfileField("kycStatus") || localStorage.getItem("userKycStatus") || "Completed";
    const balanceRaw = readProfileField("balance") || localStorage.getItem("userBalance") || null;
    const balance = balanceRaw ? Number(balanceRaw) : null;

    setProfile({
      name,
      email,
      mobile,
      kycId,
      accountNo,
      kycStatus,
      balance,
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // don't remove kyc info automatically - so user can return to account if needed
    navigate("/", { replace: true });
  };

  const goHome = () => navigate("/", { replace: true });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* top bar */}
      <header className="w-full bg-[#0a4ea6] text-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={HDFCLogo} alt="HDFC" className="h-8 w-auto rounded-sm bg-white/10 p-1" />
            <div>
              <div className="text-xs opacity-75">Welcome back</div>
              <div className="font-semibold">{profile.name?.toUpperCase()}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-sm">
              <input
                className="px-4 py-2 w-80 outline-none text-sm text-gray-700"
                placeholder="Search banking services..."
                aria-label="search"
              />
              <button className="px-3 text-gray-500">
                <RiSearchLine size={18} />
              </button>
            </div>

            <button title="Home" onClick={goHome} className="p-2 rounded-md hover:bg-white/10">
              <RiHome2Line size={20} />
            </button>
            <button title="Notifications" className="p-2 rounded-md hover:bg-white/10">
              <RiNotification3Line size={20} />
            </button>
            <button title="Profile" className="p-2 rounded-md hover:bg-white/10" onClick={() => navigate("/dashboard")}>
              <RiUser3Line size={20} />
            </button>

            <button
              onClick={handleLogout}
              title="Logout"
              className="ml-2 bg-white text-[#0a4ea6] px-3 py-1 rounded-md font-medium hover:opacity-95"
            >
              <RiLogoutBoxRLine className="inline mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* summary card */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">KYC Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">KYC Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      profile.kycStatus === "Completed"
                        ? "bg-green-100 text-green-800"
                        : profile.kycStatus === "Started"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {profile.kycStatus}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-500">Name</div>
                <div className="mt-1 font-medium">{profile.name || "—"}</div>

                <div className="mt-4 text-sm text-gray-500">Mobile</div>
                <div className="mt-1 font-medium">{profile.mobile || "—"}</div>
              </div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-500">KYC ID</div>
                    <div className="mt-1 font-medium">{profile.kycId || "N/A"}</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">Email</div>
                <div className="mt-1 font-medium">{profile.email || "—"}</div>

                <div className="mt-4 text-sm text-gray-500">Account</div>
                <div className="mt-1 font-medium">{maskAccount(profile.accountNo)}</div>
              </div>
            </div>
          </div>

          {/* side card */}
          <aside className="bg-gradient-to-br from-[#0a63d6] to-[#007bd6] text-white rounded-xl shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm opacity-80">Primary Account</div>
                <div className="text-2xl font-bold mt-2">₹ {profile.balance ? profile.balance.toLocaleString() : "—"}</div>
                <div className="text-xs opacity-80 mt-1">Available balance</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => alert("Transfer - demo")}
                className="bg-white text-[#0a63d6] px-4 py-2 rounded-md font-medium shadow"
              >
                Transfer
              </button>
              <button
                onClick={() => alert("Statement - demo")}
                className="bg-white/20 text-white px-4 py-2 rounded-md font-medium border border-white/30"
              >
                Statement
              </button>
            </div>

            <div className="mt-6 bg-white/10 p-3 rounded">
              <div className="text-sm opacity-80">Quick actions</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-white/20 px-3 py-2 rounded text-sm">Request Card</button>
                <button className="flex-1 bg-white/20 px-3 py-2 rounded text-sm">Open FD</button>
              </div>
            </div>
          </aside>
        </section>

        {/* services */}
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-6">Banking Services</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard icon={<RiBankLine size={26} />} title="Accounts" />
            <ServiceCard icon={<RiMoneyDollarCircleLine size={26} />} title="Deposits" />
            <ServiceCard icon={<RiHandCoinLine size={26} />} title="Loans" />
            <ServiceCard icon={<RiFileListLine size={26} />} title="Investments" />
            <ServiceCard icon={<RiShieldCheckLine size={26} />} title="Insurance" />
            <ServiceCard icon={<RiBankCardLine size={26} />} title="Cards" />
            <ServiceCard icon={<RiHandCoinLine size={26} />} title="Payments" />
            <ServiceCard icon={<RiShoppingCartLine size={26} />} title="Marketplace" />
            <ServiceCard icon={<RiTrainLine size={26} />} title="Travel" />
          </div>
        </section>
      </main>
    </div>
  );
}

/* small components */
function ServiceCard({ icon, title }) {
  return (
    <button
      className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition p-6 flex flex-col items-center text-center gap-3 cursor-pointer"
      onClick={() => alert(`${title} clicked (demo)`)}
    >
      <div className="bg-blue-50 p-3 rounded-md text-[#0a63d6]">{icon}</div>
      <div className="font-medium text-gray-800">{title}</div>
    </button>
  );
}
