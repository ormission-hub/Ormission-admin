/**
 * Professional PDF Report Generator & Print Engine for Ormission Admin
 * Generates publication-grade, vector-crisp documents with 100% native Bengali typography.
 */

export interface CourseReportItem {
  id: number | string;
  title: string;
  title_bn: string;
  slug: string;
  thumbnail_url?: string;
  category_name: string;
  instructor_names: string;
  price: number;
  original_price: number;
  is_free: boolean;
  status: string;
  total_enrolled: number;
  active_enrolled: number;
  total_revenue: number;
  enrolled_students?: Array<{
    id: string | number;
    userId: string;
    name: string;
    email: string;
    phone: string;
    enrolledAt: string;
    isActive: boolean;
    amountPaid: number;
    paymentMethod: string;
    orderStatus: string;
    orderNumber?: string;
  }>;
}

export interface EnrollmentSummaryData {
  totalCourses: number;
  totalEnrollments: number;
  totalActiveEnrollments: number;
  totalRevenue: number;
  topCourse?: {
    id: number | string;
    title_bn: string;
    total_enrolled: number;
    total_revenue: number;
  } | null;
  generatedAt?: string;
}

function formatCurrency(amount: number): string {
  return "৳ " + (amount || 0).toLocaleString("en-IN");
}

function formatDateBn(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/**
 * Generate and trigger print/download for the All-Courses Enrollment Summary Report
 */
export function printAllCoursesEnrollmentPdf(
  summary: EnrollmentSummaryData,
  courses: CourseReportItem[]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অ্যালাউ করুন।");
    return;
  }

  const generatedDateStr = formatDateBn(new Date().toISOString());
  const reportRef = `ORM-ENR-${Date.now().toString().slice(-6)}`;

  const rowsHtml = courses
    .map((c, idx) => {
      const feeText = c.is_free
        ? `<span class="badge free">বিনামূল্যে</span>`
        : `<span class="price">${formatCurrency(c.price)}</span>`;

      const statusBadge =
        c.status === "published"
          ? `<span class="badge active">চলমান</span>`
          : `<span class="badge draft">ড্রাফট</span>`;

      return `
        <tr>
          <td class="text-center font-mono">${idx + 1}</td>
          <td>
            <div class="course-title-bn">${c.title_bn}</div>
            <div class="course-title-en">${c.title}</div>
          </td>
          <td>${c.category_name || "সাধারণ"}</td>
          <td>${c.instructor_names || "Ormission শিক্ষকবৃন্দ"}</td>
          <td class="text-center">${feeText}</td>
          <td class="text-center font-bold font-mono highlight-enrolled">${(c.total_enrolled || 0).toLocaleString("en-US")}</td>
          <td class="text-right font-bold font-mono text-emerald-800">${formatCurrency(c.total_revenue || 0)}</td>
          <td class="text-center">${statusBadge}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>কোর্স ভর্তি ও এনরোলমেন্ট প্রতিবেদন — Ormission</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 landscape;
          margin: 12mm 15mm 12mm 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 20px 24px;
          font-size: 11pt;
          line-height: 1.4;
        }

        /* Header Branding */
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2.5px solid #F95721;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .brand-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo-badge {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #F95721 0%, #EA580C 100%);
          color: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -1px;
        }
        .brand-title {
          font-size: 20pt;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }
        .brand-tagline {
          font-size: 9pt;
          color: #64748b;
          font-weight: 500;
          margin-top: 2px;
        }
        .report-meta-right {
          text-align: right;
        }
        .report-badge-pill {
          display: inline-block;
          background: #FFF0EB;
          color: #C2410C;
          border: 1px solid #FFD3C4;
          font-size: 8.5pt;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 9999px;
          margin-bottom: 4px;
        }
        .report-title-main {
          font-size: 14pt;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .report-meta-text {
          font-size: 8.5pt;
          color: #64748b;
          margin-top: 3px;
        }

        /* KPI Cards Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .kpi-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 10px 14px;
        }
        .kpi-card.highlight {
          background: #F0FDF4;
          border-color: #BBF7D0;
        }
        .kpi-label {
          font-size: 8.5pt;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 15pt;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2px;
          font-family: 'Inter', 'Hind Siliguri', sans-serif;
        }
        .kpi-card.highlight .kpi-value {
          color: #166534;
        }

        /* Table Styling */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 9.5pt;
        }
        th {
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
          text-align: left;
          padding: 8px 10px;
          font-size: 9pt;
          border: 1px solid #0f172a;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #E2E8F0;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background-color: #F8FAFC;
        }
        tr:hover {
          background-color: #F1F5F9;
        }

        .course-title-bn {
          font-weight: 700;
          color: #0f172a;
          font-size: 9.5pt;
        }
        .course-title-en {
          font-size: 8pt;
          color: #64748b;
          font-family: 'Inter', sans-serif;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Inter', monospace; }
        .font-bold { font-weight: 700; }
        .text-emerald-800 { color: #166534; }
        .highlight-enrolled {
          color: #C2410C;
          background: #FFF7ED;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .badge {
          display: inline-block;
          font-size: 8pt;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .badge.active { background: #DCFCE7; color: #15803D; }
        .badge.draft { background: #F1F5F9; color: #475569; }
        .badge.free { background: #E0E7FF; color: #4338CA; }
        .price { font-weight: 700; font-size: 9.5pt; color: #0f172a; }

        /* Total Summary Footer Row */
        .table-summary-row {
          background: #0f172a !important;
          color: #ffffff !important;
          font-weight: 800;
        }
        .table-summary-row td {
          border-color: #0f172a;
          color: #ffffff !important;
          padding: 9px 10px;
        }

        /* Signatures Section */
        .signatures-section {
          margin-top: 36px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          page-break-inside: avoid;
        }
        .sign-block {
          text-align: center;
        }
        .sign-line {
          border-top: 1.5px dashed #94A3B8;
          margin-bottom: 6px;
        }
        .sign-role {
          font-size: 9pt;
          font-weight: 700;
          color: #1E293B;
        }
        .sign-org {
          font-size: 8pt;
          color: #64748b;
        }

        /* Report Footer */
        .report-footer {
          margin-top: 24px;
          border-top: 1px solid #E2E8F0;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #94A3B8;
        }

        /* Print Controls Floating Bar */
        .no-print-bar {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #0f172a;
          padding: 12px 20px;
          border-radius: 9999px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          display: flex;
          gap: 12px;
          align-items: center;
          z-index: 9999;
        }
        .print-btn {
          background: #F95721;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .close-btn {
          background: rgba(255,255,255,0.15);
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 9999px;
          cursor: pointer;
          font-size: 13px;
          font-family: inherit;
        }

        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <!-- Floating Print Action Trigger (Screen only) -->
      <div class="no-print-bar">
        <button class="print-btn" onclick="window.print()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-12 0v4h12v-4M6 14h12"/></svg>
          PDF হিসেবে সেভ বা প্রিন্ট করুন
        </button>
        <button class="close-btn" onclick="window.close()">বন্ধ করুন</button>
      </div>

      <!-- Header -->
      <div class="report-header">
        <div class="brand-left">
          <div class="brand-logo-badge">O</div>
          <div>
            <div class="brand-title">Ormission</div>
            <div class="brand-tagline">স্মার্ট লার্নিং ও ক্যারিয়ার প্রস্তুতি প্ল্যাটফর্ম</div>
          </div>
        </div>

        <div class="report-meta-right">
          <div class="report-badge-pill">অফিশিয়াল ভর্তি প্রতিবেদন</div>
          <h1 class="report-title-main">কোর্স ভর্তি ও এনরোলমেন্ট রিপোর্ট</h1>
          <div class="report-meta-text">
            প্রতিবেদন আইডি: <strong>${reportRef}</strong> • প্রকাশের তারিখ: ${generatedDateStr}
          </div>
        </div>
      </div>

      <!-- KPI Executive Summary -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">মোট কোর্স সংখ্যা</div>
          <div class="kpi-value">${summary.totalCourses.toLocaleString("en-US")} টি</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">সর্বমোট ভর্তি হওয়া শিক্ষার্থী</div>
          <div class="kpi-value">${summary.totalEnrollments.toLocaleString("en-US")} জন</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">সক্রিয় শিক্ষার্থী এনরোলমেন্ট</div>
          <div class="kpi-value">${summary.totalActiveEnrollments.toLocaleString("en-US")} জন</div>
        </div>
        <div class="kpi-card highlight">
          <div class="kpi-label">মোট সংগৃহীত কোর্স ফি / আয়</div>
          <div class="kpi-value">${formatCurrency(summary.totalRevenue)}</div>
        </div>
      </div>

      <!-- Course Enrollment Data Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 35px;" class="text-center">#</th>
            <th>কোর্সের নাম</th>
            <th style="width: 130px;">ক্যাটাগরি</th>
            <th style="width: 170px;">ইন্সট্রাক্টরবৃন্দ</th>
            <th style="width: 90px;" class="text-center">কোর্স ফি</th>
            <th style="width: 95px;" class="text-center">মোট শিক্ষার্থী</th>
            <th style="width: 110px;" class="text-right">মোট আয়</th>
            <th style="width: 75px;" class="text-center">স্ট্যাটাস</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <!-- Grand Total Row -->
          <tr class="table-summary-row">
            <td colspan="5" style="text-align: right; padding-right: 16px;">সর্বমোট (Grand Total):</td>
            <td class="text-center font-mono" style="font-size: 11pt;">${summary.totalEnrollments.toLocaleString("en-US")}</td>
            <td class="text-right font-mono" style="font-size: 11pt;">${formatCurrency(summary.totalRevenue)}</td>
            <td class="text-center">—</td>
          </tr>
        </tbody>
      </table>

      <!-- Signatures -->
      <div class="signatures-section">
        <div class="sign-block">
          <div class="sign-line"></div>
          <div class="sign-role">প্রস্তুতকারক (অ্যাডমিন শাখা)</div>
          <div class="sign-org">Ormission এডু প্ল্যাটফর্ম</div>
        </div>
        <div class="sign-block">
          <div class="sign-line"></div>
          <div class="sign-role">শিক্ষা সমন্বয়ক ও তত্ত্বাবধায়ক</div>
          <div class="sign-org">অ্যাকাডেমিক বিভাগ</div>
        </div>
        <div class="sign-block">
          <div class="sign-line"></div>
          <div class="sign-role">পরীক্ষক ও হিসাব নিয়ন্ত্রক</div>
          <div class="sign-org">Ormission ম্যানেজমেন্ট</div>
        </div>
      </div>

      <!-- Footer Disclaimer -->
      <div class="report-footer">
        <div>এই প্রতিবেদনটি Ormission প্ল্যাটফর্মের রিয়েল-টাইম ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত। কোনো অননুমোদিত পরিবর্তন গ্রহণযোগ্য নয়।</div>
        <div>পৃষ্ঠা ১ / ১ • ormission.com</div>
      </div>

      <script>
        // Auto trigger print dialog after document assets load
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 450);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generate and trigger print/download for an Individual Course's Student Admission Roster
 */
export function printSingleCourseRosterPdf(course: CourseReportItem) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("পপ-আপ উইন্ডো ব্লক করা রয়েছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অ্যালাউ করুন।");
    return;
  }

  const generatedDateStr = formatDateBn(new Date().toISOString());
  const reportRef = `ORM-CRS-${course.id}-${Date.now().toString().slice(-4)}`;
  const students = course.enrolled_students || [];

  const studentRows = students.length > 0
    ? students
        .map((s, idx) => {
          const statusBadge = s.isActive
            ? `<span class="badge active">সক্রিয়</span>`
            : `<span class="badge inactive">নিষ্ক্রিয়</span>`;

          return `
            <tr>
              <td class="text-center font-mono">${idx + 1}</td>
              <td>
                <div class="student-name">${s.name || "অজ্ঞাত শিক্ষার্থী"}</div>
                <div class="student-email font-mono">${s.email || "—"}</div>
              </td>
              <td class="font-mono text-center">${s.phone || "—"}</td>
              <td class="text-center">${formatDateBn(s.enrolledAt)}</td>
              <td class="text-center font-mono">${s.orderNumber || "—"}</td>
              <td class="text-center">${s.paymentMethod || "—"}</td>
              <td class="text-right font-mono font-bold">${formatCurrency(s.amountPaid || 0)}</td>
              <td class="text-center">${statusBadge}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">এই কোর্সে এখনো কোনো শিক্ষার্থী ভর্তি হয়নি।</td></tr>`;

  const html = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${course.title_bn} — ভর্তিকৃত শিক্ষার্থী তালিকা</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 14mm 12mm 14mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Hind Siliguri', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 16px 20px;
          font-size: 10pt;
          line-height: 1.35;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #F95721;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .brand-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo-badge {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #F95721 0%, #EA580C 100%);
          color: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
        }
        .brand-title {
          font-size: 17pt;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }
        .brand-tagline {
          font-size: 8pt;
          color: #64748b;
        }
        .report-meta-right { text-align: right; }
        .report-badge-pill {
          display: inline-block;
          background: #FFF0EB;
          color: #C2410C;
          border: 1px solid #FFD3C4;
          font-size: 8pt;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
          margin-bottom: 3px;
        }

        .course-banner {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .course-title-main {
          font-size: 13pt;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .course-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 8.5pt;
          color: #475569;
        }

        .kpi-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .kpi-mini {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 8px 12px;
          text-align: center;
        }
        .kpi-mini-lbl { font-size: 7.5pt; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .kpi-mini-val { font-size: 13pt; font-weight: 800; color: #0f172a; font-family: 'Inter', sans-serif; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 8.5pt;
        }
        th {
          background: #0f172a;
          color: #ffffff;
          font-weight: 700;
          padding: 7px 8px;
          border: 1px solid #0f172a;
          font-size: 8pt;
        }
        td {
          padding: 6px 8px;
          border: 1px solid #E2E8F0;
        }
        tr:nth-child(even) { background-color: #F8FAFC; }

        .student-name { font-weight: 700; color: #0f172a; }
        .student-email { font-size: 7.5pt; color: #64748b; }
        .font-mono { font-family: 'Inter', monospace; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge { display: inline-block; font-size: 7.5pt; font-weight: 700; padding: 1.5px 6px; border-radius: 3px; }
        .badge.active { background: #DCFCE7; color: #15803D; }
        .badge.inactive { background: #FEE2E2; color: #991B1B; }

        .signatures-section {
          margin-top: 30px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 60px;
          page-break-inside: avoid;
        }
        .sign-block { text-align: center; }
        .sign-line { border-top: 1.5px dashed #94A3B8; margin-bottom: 6px; }
        .sign-role { font-size: 8.5pt; font-weight: 700; color: #1E293B; }
        .sign-org { font-size: 7.5pt; color: #64748b; }

        .report-footer {
          margin-top: 20px;
          border-top: 1px solid #E2E8F0;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 7pt;
          color: #94A3B8;
        }

        .no-print-bar {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #0f172a;
          padding: 10px 18px;
          border-radius: 9999px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          display: flex;
          gap: 10px;
          align-items: center;
          z-index: 9999;
        }
        .print-btn {
          background: #F95721;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 12px;
          font-family: inherit;
        }
        .close-btn {
          background: rgba(255,255,255,0.15);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 9999px;
          cursor: pointer;
          font-size: 12px;
          font-family: inherit;
        }

        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <button class="print-btn" onclick="window.print()">PDF হিসেবে সেভ করুন</button>
        <button class="close-btn" onclick="window.close()">বন্ধ করুন</button>
      </div>

      <div class="report-header">
        <div class="brand-left">
          <div class="brand-logo-badge">O</div>
          <div>
            <div class="brand-title">Ormission</div>
            <div class="brand-tagline">কোর্স শিক্ষার্থী তালিকা (Student Admission Roster)</div>
          </div>
        </div>
        <div class="report-meta-right">
          <div class="report-badge-pill">কোর্স ভর্তি রেজিস্টার</div>
          <div style="font-size: 8pt; color: #64748b;">আইডি: <strong>${reportRef}</strong></div>
          <div style="font-size: 8pt; color: #64748b;">তারিখ: ${generatedDateStr}</div>
        </div>
      </div>

      <div class="course-banner">
        <div class="course-title-main">${course.title_bn}</div>
        <div class="course-meta-row">
          <div><strong>ক্যাটাগরি:</strong> ${course.category_name}</div>
          <div><strong>ইন্সট্রাক্টর:</strong> ${course.instructor_names}</div>
          <div><strong>কোর্স ফি:</strong> ${course.is_free ? "বিনামূল্যে" : formatCurrency(course.price)}</div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-mini">
          <div class="kpi-mini-lbl">মোট ভর্তিকৃত শিক্ষার্থী</div>
          <div class="kpi-mini-val" style="color: #C2410C;">${course.total_enrolled.toLocaleString("en-US")} জন</div>
        </div>
        <div class="kpi-mini">
          <div class="kpi-mini-lbl">সক্রিয় শিক্ষার্থী</div>
          <div class="kpi-mini-val" style="color: #15803D;">${course.active_enrolled.toLocaleString("en-US")} জন</div>
        </div>
        <div class="kpi-mini">
          <div class="kpi-mini-lbl">মোট সংগৃহীত কোর্স ফি</div>
          <div class="kpi-mini-val" style="color: #047857;">${formatCurrency(course.total_revenue)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;" class="text-center">#</th>
            <th>শিক্ষার্থীর নাম ও ইমেইল</th>
            <th style="width: 100px;" class="text-center">মোবাইল</th>
            <th style="width: 130px;" class="text-center">ভর্তির তারিখ</th>
            <th style="width: 85px;" class="text-center">অর্ডার নং</th>
            <th style="width: 90px;" class="text-center">পেমেন্ট মেথড</th>
            <th style="width: 80px;" class="text-right">পরিশোধ</th>
            <th style="width: 60px;" class="text-center">অবস্থা</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>

      <div class="signatures-section">
        <div class="sign-block">
          <div class="sign-line"></div>
          <div class="sign-role">প্রস্তুতকারক ও কোর্স মডারেটর</div>
          <div class="sign-org">Ormission এডমিন টিম</div>
        </div>
        <div class="sign-block">
          <div class="sign-line"></div>
          <div class="sign-role">অনুমোদনকারী ও অ্যাকাউন্টস অফিসার</div>
          <div class="sign-org">Ormission ম্যানেজমেন্ট</div>
        </div>
      </div>

      <div class="report-footer">
        <div>অফিশিয়াল কোর্স এনরোলমেন্ট ডাটাবেজ • Ormission লার্নিং প্ল্যাটফর্ম</div>
        <div>ormission.com</div>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 450);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
