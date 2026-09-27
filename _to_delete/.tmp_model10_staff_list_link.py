# -*- coding: utf-8 -*-
import io

PATH = "app/admin/staff/page.jsx"

with io.open(PATH, "r", encoding="utf-8") as f:
    c = f.read()


def r1(c, old, new, label):
    n = c.count(old)
    assert n == 1, "%s: expected 1, found %d" % (label, n)
    return c.replace(old, new)


c = r1(
    c,
    """                                        <tr>
                                            <th>Name</th>
                                            <th>Position</th>
                                            <th>Faculty / Dept</th>
                                            <th>Employee No.</th>
                                            <th>Status</th>
                                            <th></th>
                                        </tr>""",
    """                                        <tr>
                                            <th>Name</th>
                                            <th>Position</th>
                                            <th>Faculty / Dept</th>
                                            <th>Employee No.</th>
                                            <th>Status</th>
                                            <th></th>
                                            <th></th>
                                        </tr>""",
    "staff table header",
)

c = r1(
    c,
    """                                                <td>
                                                    <button
                                                        disabled={busyId === s.id}
                                                        onClick={() => toggleActive(s.id, s.isActive)}
                                                        className={s.isActive ? 'ih-btn ih-btn-danger' : 'ih-btn ih-btn-secondary'}
                                                        style={{ padding: '6px 10px', fontSize: 12 }}
                                                    >
                                                        {s.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                            </tr>""",
    """                                                <td>
                                                    <button
                                                        disabled={busyId === s.id}
                                                        onClick={() => toggleActive(s.id, s.isActive)}
                                                        className={s.isActive ? 'ih-btn ih-btn-danger' : 'ih-btn ih-btn-secondary'}
                                                        style={{ padding: '6px 10px', fontSize: 12 }}
                                                    >
                                                        {s.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <Link href={`/admin/staff/${s.id}`} style={{ color: 'var(--brand)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                                                        Profile →
                                                    </Link>
                                                </td>
                                            </tr>""",
    "staff table row action link",
)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(c)

print("admin/staff/page.jsx updated with Profile links.")
