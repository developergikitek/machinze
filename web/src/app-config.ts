// Native app ke header/footer/theme ka config. Isse badal ke sirf web deploy karo —
// app update ki zarurat nahi. App ise /api/app-config se fetch karta hai.
// Type mobile/src/appConfig.ts ke saath same rakhna.
// Icons: Ionicons names — https://icons.expo.fyi (filter: Ionicons)

export type NavItem = {
  key: string;
  label: string;
  icon: string;
  path: string;
};

export type HeaderAction = {
  key: string;
  icon: string;
  path: string;
  // Static badge; page bhi { type: "badge" } message bhej ke count set kar sakta hai
  badge?: number;
};

export type AppConfig = {
  version: number;
  // App khulne pe WebView ka pehla page (splash native hai, isliye seedha login)
  startPath: string;
  theme: {
    primary: string;
    background: string;
    text: string;
    muted: string;
    border: string;
  };
  header: {
    visible: boolean;
    title: string;
    // true ho to web page ka <title> header me dikhega
    useWebTitle: boolean;
    showBack: boolean;
    actions: HeaderAction[];
    // in paths pe header chhupa do (prefix match)
    hiddenOn: string[];
    // in paths pe title ki jagah location + logo wala header
    brandOn: string[];
  };
  // Swiggy jaisa bar — chal rahi booking ho to har page pe footer ke upar
  tracker: {
    visible: boolean;
    hiddenOn: string[];
  };
  footer: {
    visible: boolean;
    showLabels: boolean;
    tabs: NavItem[];
    hiddenOn: string[];
  };
};

export const appConfig: AppConfig = {
  version: 1,
  startPath: "/login",
  theme: {
    primary: "#f5a91b",
    background: "#ffffff",
    text: "#111c4e",
    muted: "#8a94a6",
    border: "#eceef2",
  },
  header: {
    visible: true,
    title: "Machinze",
    useWebTitle: true,
    showBack: true,
    // Inbox sirf home pe hai (web HomeHeader me) — baaki pages pe header me koi icon nahi.
    // Kisi page pe chahiye ho to: { key: "inbox", icon: "file-tray-outline", path: "/client/notifications" }
    actions: [],
    // equipment detail ka apna header hai (back, ❤️, share)
    // Home ka header web me hai (Swiggy jaisa scroll hota hai) — isliye native header wahan nahi
    hiddenOn: ["/", "/login", "/onboarding", "/location", "/client/home", "/client/equipment", "/client/book", "/client/bookings/confirmed"],
    brandOn: [],
  },
  tracker: {
    visible: true,
    // equipment detail pe neeche Book Now bar hai
    hiddenOn: ["/", "/login", "/onboarding", "/location", "/client/equipment", "/client/book", "/client/bookings/confirmed"],
  },
  footer: {
    visible: true,
    showLabels: true,
    tabs: [
      { key: "home", label: "Home", icon: "home-outline", path: "/client/home" },
      { key: "bookings", label: "Bookings", icon: "calendar-outline", path: "/client/bookings" },
      { key: "liked", label: "Liked", icon: "heart-outline", path: "/client/liked" },
      { key: "profile", label: "Profile", icon: "person-outline", path: "/client/profile" },
    ],
    // booking flow pe tabs nahi — dhyan sirf booking pe
    hiddenOn: ["/", "/login", "/onboarding", "/location", "/client/book"],
  },
};
