# -*- coding: utf-8 -*-
import io

PATH = "app/admin/admissions/page.jsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    content = f.read()


def r1(content, old, new, label):
    c = content.count(old)
    assert c == 1, "%s: expected 1 match, found %d" % (label, c)
    return content.replace(old, new)


content = r1(
    content,
    "        <h1 style={heading}>Admissions — Oversight View</h1>\n        <p style={muted}>\n          Read-only. Application processing is handled by Registry / Admissions\n          staff at their own dashboard.\n        </p>",
    "        <h1 style={heading}>Admissions — Oversight View</h1>\n        <p style={muted}>\n          Open an application to review its full details, documents and\n          make an admission decision.\n        </p>",
    "list page intro text",
)

content = r1(
    content,
    """              <tr>
                <th>Applicant</th>
                <th>Application #</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={5}>
                    No admission applications yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.fullName}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>{app.email}</div>
                    </td>
                    <td className="mono">{app.applicationNumber}</td>
                    <td>
                      {app.payment
                        ? `${app.payment.status} — ${app.payment.currencyCode} ${app.payment.amount}`
                        : 'No payment'}
                    </td>
                    <td>
                      <span className={`ih-badge ${badgeClass(app.status)}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="mono">{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>""",
    """              <tr>
                <th>Applicant</th>
                <th>Application #</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center', color: 'var(--ink-soft)' }} colSpan={6}>
                    No admission applications yet.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.fullName}</div>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>{app.email}</div>
                    </td>
                    <td className="mono">{app.applicationNumber}</td>
                    <td>
                      {app.payment
                        ? `${app.payment.status} — ${app.payment.currencyCode} ${app.payment.amount}`
                        : 'No payment'}
                    </td>
                    <td>
                      <span className={`ih-badge ${badgeClass(app.status)}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="mono">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/admissions/${app.id}`} style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>""",
    "list page add Review link column",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("admissions list page updated with Review links.")
