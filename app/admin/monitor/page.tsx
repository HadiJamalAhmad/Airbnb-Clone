import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/utils/db";

async function getMonitoringData() {
  const [totalProperties, totalBookings, totalProfiles, recentBookings, allBookings, allProperties, allProfiles] =
    await Promise.all([
      db.property.count(),
      db.booking.count(),
      db.profile.count(),
      db.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          property: { select: { name: true, price: true } },
          profile: { select: { firstName: true, email: true } },
        },
      }),
      db.booking.findMany({
        include: { profile: { select: { clerkId: true, createdAt: true } } },
      }),
      db.property.findMany({ include: { bookings: true, reviews: true } }),
      db.profile.findMany({ select: { clerkId: true, createdAt: true } }),
    ]);

  const now = new Date();
  const paidBookings = allBookings.filter((b) => b.paymentStatus);
  const unpaidBookings = allBookings.filter((b) => !b.paymentStatus);

  // ── REVENUE ──────────────────────────────────────────────
  const gmv = paidBookings.reduce((s, b) => s + b.orderTotal, 0);
  const platformRevenue = gmv * 0.145;
  const stripeFees = gmv * 0.025;
  const netRevenue = platformRevenue - stripeFees;
  const takeRate = gmv > 0 ? (platformRevenue / gmv) * 100 : 0;

  // ── THIS MONTH ───────────────────────────────────────────
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthBookings = paidBookings.filter((b) => new Date(b.createdAt) >= startOfMonth);
  const lastMonthBookings = paidBookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  });

  const gmvThisMonth = thisMonthBookings.reduce((s, b) => s + b.orderTotal, 0);
  const gmvLastMonth = lastMonthBookings.reduce((s, b) => s + b.orderTotal, 0);
  const revenueThisMonth = gmvThisMonth * 0.12;
  const momGrowth = gmvLastMonth > 0 ? ((gmvThisMonth - gmvLastMonth) / gmvLastMonth) * 100 : 0;

  // ── THIS YEAR ────────────────────────────────────────────
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

  const thisYearBookings = paidBookings.filter((b) => new Date(b.createdAt) >= startOfYear);
  const lastYearBookings = paidBookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d >= startOfLastYear && d <= endOfLastYear;
  });

  const gmvThisYear = thisYearBookings.reduce((s, b) => s + b.orderTotal, 0);
  const gmvLastYear = lastYearBookings.reduce((s, b) => s + b.orderTotal, 0);
  const revenueThisYear = gmvThisYear * 0.12;
  const yoyGrowth = gmvLastYear > 0 ? ((gmvThisYear - gmvLastYear) / gmvLastYear) * 100 : 0;

  // ── BOOKINGS & STAYS ─────────────────────────────────────
  const totalNights = paidBookings.reduce((s, b) => s + b.totalNights, 0);
  const avgBookingValue = paidBookings.length > 0 ? gmv / paidBookings.length : 0;
  const avgNightlyRate = totalNights > 0 ? gmv / totalNights : 0;
  const avgStayLength = paidBookings.length > 0 ? totalNights / paidBookings.length : 0;
  const cancellationRate = allBookings.length > 0 ? (unpaidBookings.length / allBookings.length) * 100 : 0;
  const paymentSuccessRate = allBookings.length > 0 ? (paidBookings.length / allBookings.length) * 100 : 0;

  // ── NIGHTLY RATES ────────────────────────────────────────
  const prices = allProperties.map((p) => p.price).sort((a, b) => a - b);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const medianPrice = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
  const p25Price = prices.length > 0 ? prices[Math.floor(prices.length * 0.25)] : 0;
  const p75Price = prices.length > 0 ? prices[Math.floor(prices.length * 0.75)] : 0;

  // Extrapolate monthly revenue from nightly rates
  const avgMonthlyGMVPerListing = avgNightlyRate * 30 * 0.4; // assume 40% occupancy
  const projectedMonthlyGMV = totalProperties * avgMonthlyGMVPerListing;
  const projectedMonthlyRevenue = projectedMonthlyGMV * 0.12;

  // ── MARKETPLACE HEALTH ───────────────────────────────────
  const bookedPropertyIds = new Set(paidBookings.map((b) => b.propertyId));
  const liquidityRate = totalProperties > 0 ? (bookedPropertyIds.size / totalProperties) * 100 : 0;
  const revPAN = totalProperties > 0 ? gmvThisMonth / (totalProperties * 30) : 0;
  const bookingsPerListing = totalProperties > 0 ? totalBookings / totalProperties : 0;
  const avgReviewsPerProperty = allProperties.length > 0
    ? allProperties.reduce((s, p) => s + p.reviews.length, 0) / allProperties.length : 0;

  // ── USER METRICS ─────────────────────────────────────────
  const newUsersThisMonth = allProfiles.filter((p) => new Date(p.createdAt) >= startOfMonth).length;
  const newUsersLastMonth = allProfiles.filter((p) => {
    const d = new Date(p.createdAt);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }).length;
  const userGrowthRate = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;

  // Guests who booked more than once (repeat rate)
  const guestBookingCount: Record<string, number> = {};
  paidBookings.forEach((b) => {
    guestBookingCount[b.profileId] = (guestBookingCount[b.profileId] || 0) + 1;
  });
  const repeatGuests = Object.values(guestBookingCount).filter((c) => c > 1).length;
  const totalUniqueGuests = Object.keys(guestBookingCount).length;
  const repeatBookingRate = totalUniqueGuests > 0 ? (repeatGuests / totalUniqueGuests) * 100 : 0;

  // Hosts (properties owners)
  const hostIds = new Set(allProperties.map((p) => p.profileId));
  const totalHosts = hostIds.size;
  const activeHosts = allProperties.filter((p) => p.bookings.some((b) => b.paymentStatus)).length;
  const hostActivationRate = totalHosts > 0 ? (activeHosts / totalHosts) * 100 : 0;

  // ── COHORT REVENUE RETENTION ─────────────────────────────
  // Month 1, 2, 3 cohorts
  const cohortM1 = paidBookings.filter((b) => {
    const d = new Date(b.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).reduce((s, b) => s + b.orderTotal, 0);

  const cohortM2 = paidBookings.filter((b) => {
    const d = new Date(b.createdAt);
    const target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
  }).reduce((s, b) => s + b.orderTotal, 0);

  const cohortM3 = paidBookings.filter((b) => {
    const d = new Date(b.createdAt);
    const target = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
  }).reduce((s, b) => s + b.orderTotal, 0);

  // ── CONTRIBUTION MARGIN WATERFALL ────────────────────────
  const grossPlatformRevenue = gmv * 0.145;
  const paymentProcessingCost = gmv * 0.025;
  const revenueAfterPayment = grossPlatformRevenue - paymentProcessingCost;
  const fraudReserve = gmv * 0.01;
  const netTransactionRevenue = revenueAfterPayment - fraudReserve;
  const estimatedSupportCost = totalBookings * 0.8;
  const contributionMargin = netTransactionRevenue - estimatedSupportCost;
  const contributionMarginRate = gmv > 0 ? (contributionMargin / gmv) * 100 : 0;

  // ── FUNNEL METRICS ───────────────────────────────────────
  const bookingConversionRate = totalProfiles > 0 ? (paidBookings.length / totalProfiles) * 100 : 0;
  const listingToBookingRate = totalProperties > 0 ? (paidBookings.length / totalProperties) * 100 : 0;

  return {
    // Overview
    totalProperties, totalBookings, totalProfiles,
    // Revenue
    gmv, platformRevenue, stripeFees, netRevenue, takeRate,
    // Month
    gmvThisMonth, gmvLastMonth, revenueThisMonth, momGrowth,
    // Year
    gmvThisYear, gmvLastYear, revenueThisYear, yoyGrowth,
    // Bookings
    totalNights, avgBookingValue, avgNightlyRate, avgStayLength,
    cancellationRate, paymentSuccessRate,
    paidBookings: paidBookings.length,
    // Prices
    avgPrice, medianPrice, p25Price, p75Price,
    projectedMonthlyGMV, projectedMonthlyRevenue,
    // Marketplace
    liquidityRate, revPAN, bookingsPerListing, avgReviewsPerProperty,
    // Users
    newUsersThisMonth, newUsersLastMonth, userGrowthRate,
    totalUniqueGuests, repeatGuests, repeatBookingRate,
    totalHosts, activeHosts, hostActivationRate,
    // Cohorts
    cohortM1, cohortM2, cohortM3,
    // Contribution margin
    grossPlatformRevenue, paymentProcessingCost, revenueAfterPayment,
    fraudReserve, netTransactionRevenue, estimatedSupportCost,
    contributionMargin, contributionMarginRate,
    // Funnel
    bookingConversionRate, listingToBookingRate,
    // Recent
    recentBookings,
  };
}

export default async function MonitorPage() {
  const { userId } = auth();
  if (userId !== process.env.ADMIN_USER_ID) redirect("/");

  const d = await getMonitoringData();

  const Card = ({ title, value, sub, color = "blue", alert = false }: any) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow border-l-4 border-${color}-500 ${alert ? "ring-2 ring-red-400" : ""}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  const Section = ({ title, children, cols = 4 }: any) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">{title}</h2>
      <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-4`}>{children}</div>
    </div>
  );

  const WaterfallRow = ({ label, value, sign = "" }: any) => (
    <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`font-semibold ${sign === "-" ? "text-red-500" : "text-green-600"}`}>
        {sign}€{Math.round(Math.abs(value)).toLocaleString()}
      </span>
    </div>
  );

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h1 className="text-3xl font-bold">Tayibnb Monitor</h1>
        <span className="ml-auto text-sm text-gray-400">
          Admin only • {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Revenue Overview */}
      <Section title="💰 Revenue Overview">
        <Card title="Total GMV (All Time)" value={`€${d.gmv.toLocaleString()}`} sub="Gross merchandise value" color="green" />
        <Card title="Platform Revenue (14.5%)" value={`€${Math.round(d.platformRevenue).toLocaleString()}`} sub="Before fees" color="green" />
        <Card title="Net Revenue" value={`€${Math.round(d.netRevenue).toLocaleString()}`} sub="After Stripe & fraud" color="emerald" />
        <Card title="Take Rate" value={`${d.takeRate.toFixed(1)}%`} sub="Platform margin on GMV" color="green" />
      </Section>

      {/* This Month */}
      <Section title="📅 This Month">
        <Card title="GMV This Month" value={`€${d.gmvThisMonth.toLocaleString()}`} color="blue" />
        <Card title="Revenue This Month" value={`€${Math.round(d.revenueThisMonth).toLocaleString()}`} color="blue" />
        <Card title="GMV Last Month" value={`€${d.gmvLastMonth.toLocaleString()}`} color="gray" />
        <Card title="MoM Growth" value={`${d.momGrowth.toFixed(1)}%`} sub="Month over month" color={d.momGrowth >= 0 ? "green" : "red"} />
      </Section>

      {/* This Year */}
      <Section title="📆 This Year">
        <Card title="GMV This Year" value={`€${d.gmvThisYear.toLocaleString()}`} color="blue" />
        <Card title="Revenue This Year" value={`€${Math.round(d.revenueThisYear).toLocaleString()}`} color="blue" />
        <Card title="GMV Last Year" value={`€${d.gmvLastYear.toLocaleString()}`} color="gray" />
        <Card title="YoY Growth" value={`${d.yoyGrowth.toFixed(1)}%`} sub="Year over year" color={d.yoyGrowth >= 0 ? "green" : "red"} />
      </Section>

      {/* Projected Revenue */}
      <Section title="🔮 Revenue Projections (Based on Current Data)">
        <Card title="Avg Nightly Rate" value={`€${Math.round(d.avgNightlyRate)}`} sub="Revenue per booked night" color="violet" />
        <Card title="Projected Monthly GMV" value={`€${Math.round(d.projectedMonthlyGMV).toLocaleString()}`} sub="At 40% occupancy" color="violet" />
        <Card title="Projected Monthly Revenue" value={`€${Math.round(d.projectedMonthlyRevenue).toLocaleString()}`} sub="Net platform revenue" color="violet" />
        <Card title="Nights to €2k/founder" value={Math.ceil(4000 / (d.avgNightlyRate * 0.095 || 1))} sub="Nights needed/month" color="violet" />
      </Section>

      {/* Bookings */}
      <Section title="🏠 Bookings & Stays">
        <Card title="Total Bookings" value={d.totalBookings} color="purple" />
        <Card title="Paid Bookings" value={d.paidBookings} color="purple" />
        <Card title="Avg Booking Value" value={`€${Math.round(d.avgBookingValue)}`} color="purple" />
        <Card title="Avg Stay Length" value={`${d.avgStayLength.toFixed(1)} nights`} color="purple" />
        <Card title="Total Nights Booked" value={d.totalNights} color="purple" />
        <Card title="Cancellation Rate" value={`${d.cancellationRate.toFixed(1)}%`} color={d.cancellationRate > 10 ? "red" : "green"} alert={d.cancellationRate > 15} />
        <Card title="Payment Success Rate" value={`${d.paymentSuccessRate.toFixed(1)}%`} color={d.paymentSuccessRate > 90 ? "green" : "red"} />
        <Card title="Booking→Listing Rate" value={`${d.listingToBookingRate.toFixed(1)}%`} sub="Bookings per listing" color="purple" />
      </Section>

      {/* Nightly Rates */}
      <Section title="🌙 Nightly Rate Distribution">
        <Card title="P25 (Budget)" value={`€${d.p25Price}`} sub="25th percentile" color="orange" />
        <Card title="Median Price" value={`€${d.medianPrice}`} sub="Middle price point" color="orange" />
        <Card title="Mean Price" value={`€${Math.round(d.avgPrice)}`} sub="Average listed price" color="orange" />
        <Card title="P75 (Premium)" value={`€${d.p75Price}`} sub="75th percentile" color="orange" />
      </Section>

      {/* Marketplace Health */}
      <Section title="🏪 Marketplace Health">
        <Card title="Total Listings" value={d.totalProperties} color="teal" />
        <Card title="Liquidity Rate" value={`${d.liquidityRate.toFixed(1)}%`} sub="% listings ever booked" color={d.liquidityRate > 15 ? "green" : "yellow"} />
        <Card title="RevPAN" value={`€${d.revPAN.toFixed(2)}`} sub="Revenue/available night" color="teal" />
        <Card title="Avg Reviews/Property" value={d.avgReviewsPerProperty.toFixed(1)} sub="Trust signal" color="teal" />
      </Section>

      {/* User Metrics */}
      <Section title="👥 User & Growth Metrics">
        <Card title="Total Users" value={d.totalProfiles} color="indigo" />
        <Card title="New Users This Month" value={d.newUsersThisMonth} color="indigo" />
        <Card title="User Growth Rate" value={`${d.userGrowthRate.toFixed(1)}%`} sub="MoM user growth" color={d.userGrowthRate >= 0 ? "green" : "red"} />
        <Card title="Unique Guests (Booked)" value={d.totalUniqueGuests} color="indigo" />
        <Card title="Repeat Guests" value={d.repeatGuests} color="indigo" />
        <Card title="Repeat Booking Rate" value={`${d.repeatBookingRate.toFixed(1)}%`} sub="Guests who booked 2+" color={d.repeatBookingRate > 20 ? "green" : "yellow"} />
        <Card title="Total Hosts" value={d.totalHosts} color="indigo" />
        <Card title="Host Activation Rate" value={`${d.hostActivationRate.toFixed(1)}%`} sub="Hosts with ≥1 booking" color={d.hostActivationRate > 50 ? "green" : "yellow"} />
        <Card title="Booking Conversion" value={`${d.bookingConversionRate.toFixed(1)}%`} sub="Users who booked" color="indigo" />
      </Section>

      {/* Cohort Revenue Retention */}
      <Section title="📊 Cohort Revenue Retention (Last 3 Months)" cols={3}>
        <Card title={`Month -2 GMV`} value={`€${d.cohortM3.toLocaleString()}`} sub="2 months ago" color="blue" />
        <Card title={`Month -1 GMV`} value={`€${d.cohortM2.toLocaleString()}`} sub="Last month" color="blue" />
        <Card title={`This Month GMV`} value={`€${d.cohortM1.toLocaleString()}`} sub="Current month" color={d.cohortM1 >= d.cohortM2 ? "green" : "red"} />
      </Section>

      {/* Contribution Margin Waterfall */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">💵 Contribution Margin Waterfall</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow max-w-lg">
          <WaterfallRow label="Gross Booking Value (GMV)" value={d.gmv} />
          <WaterfallRow label="Platform Revenue (14.5%)" value={d.grossPlatformRevenue} />
          <WaterfallRow label="— Stripe Fees (2.5%)" value={d.paymentProcessingCost} sign="-" />
          <WaterfallRow label="= Revenue After Payment" value={d.revenueAfterPayment} />
          <WaterfallRow label="— Fraud/Chargeback Reserve (1%)" value={d.fraudReserve} sign="-" />
          <WaterfallRow label="= Net Transaction Revenue" value={d.netTransactionRevenue} />
          <WaterfallRow label="— Est. Support Cost (€0.80/booking)" value={d.estimatedSupportCost} sign="-" />
          <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-gray-300">
            <span className="font-bold">Contribution Margin</span>
            <span className="font-bold text-xl text-green-600">€{Math.round(d.contributionMargin).toLocaleString()} ({d.contributionMarginRate.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">🕐 Recent Bookings</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["Guest", "Property", "Nights", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="p-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.recentBookings.map((b: any) => (
                <tr key={b.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="p-3">{b.profile.firstName}</td>
                  <td className="p-3">{b.property.name.substring(0, 20)}</td>
                  <td className="p-3">{b.totalNights}</td>
                  <td className="p-3 font-semibold">€{b.orderTotal}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.paymentStatus ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {b.paymentStatus ? "✓ Paid" : "⏳ Pending"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(b.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {d.recentBookings.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No bookings yet — go get some listings! 🚀</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}