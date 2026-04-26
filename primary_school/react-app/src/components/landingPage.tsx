// components/LandingPage.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./LandingPage.module.css";

const LandingPage: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeRole, setActiveRole] = useState("admin");
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const mx = useRef(0);
    const my = useRef(0);
    const rx = useRef(0);
    const ry = useRef(0);

    // Custom cursor animation
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mx.current = e.clientX;
            my.current = e.clientY;
            if (dotRef.current) {
                dotRef.current.style.left = mx.current + "px";
                dotRef.current.style.top = my.current + "px";
            }
        };

        const animateRing = () => {
            rx.current += (mx.current - rx.current) * 0.12;
            ry.current += (my.current - ry.current) * 0.12;
            if (ringRef.current) {
                ringRef.current.style.left = rx.current + "px";
                ringRef.current.style.top = ry.current + "px";
            }
            requestAnimationFrame(animateRing);
        };

        document.addEventListener("mousemove", handleMouseMove);
        const animFrame = requestAnimationFrame(animateRing);

        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll("a, button, .feat-card, .testi-card, .price-card");
        const handleMouseEnter = () => ringRef.current?.classList.add("expanded");
        const handleMouseLeave = () => ringRef.current?.classList.remove("expanded");

        interactiveElements.forEach(el => {
            el.addEventListener("mouseenter", handleMouseEnter);
            el.addEventListener("mouseleave", handleMouseLeave);
        });

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animFrame);
            interactiveElements.forEach(el => {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, []);

    // Nav scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll reveal observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(styles.visible);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        const revealElements = document.querySelectorAll(`.${styles.reveal}, .${styles.revealLeft}, .${styles.revealRight}, .${styles.revealScale}`);
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // Bar animation observer
    useEffect(() => {
        const barObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const fills = entry.target.querySelectorAll(`.${styles.heroBarFill}`);
                        fills.forEach(fill => {
                            const el = fill as HTMLElement;
                            const width = el.getAttribute("data-w") || "0";
                            el.style.width = width;
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        const heroCard = document.querySelector(`.${styles.heroCardFloat}`);
        if (heroCard) barObserver.observe(heroCard);

        return () => barObserver.disconnect();
    }, []);

    // Smooth anchor scroll
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                const href = anchor.getAttribute("href");
                if (href) {
                    const element = document.querySelector(href);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            }
        };
        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, []);

    const switchRole = (role: string) => {
        setActiveRole(role);
        // Re-trigger reveal for newly shown content
        setTimeout(() => {
            const newContent = document.getElementById(`role-${role}`);
            if (newContent) {
                const reveals = newContent.querySelectorAll(`.${styles.revealLeft}, .${styles.revealRight}`);
                reveals.forEach(el => {
                    el.classList.remove(styles.visible);
                    setTimeout(() => el.classList.add(styles.visible), 30);
                });
            }
        }, 30);
    };

    return (
        <div className={styles.app}>
            {/* Custom Cursor */}
            <div ref={dotRef} className={`${styles.cursor} ${styles.cursorDot}`} />
            <div ref={ringRef} className={`${styles.cursor} ${styles.cursorRing}`} />

            {/* Navigation */}
            <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
                <a href="#" className={styles.navLogo}>
                    <div className={styles.navLogoBadge}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div className={styles.navLogoText}>
                        <span className={styles.navLogoName}>Elimu Pro</span>
                        <span className={styles.navLogoSub}>School Management</span>
                    </div>
                </a>
                <div className={styles.navLinks}>
                    <a href="#features" className={styles.navLink}>Features</a>
                    <a href="#roles" className={styles.navLink}>Roles</a>
                    <a href="#how" className={styles.navLink}>How it works</a>
                    <a href="#pricing" className={styles.navLink}>Pricing</a>
                </div>
                <a href="/login" className={styles.navCta}>Sign in →</a>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero}>
                <svg className={styles.heroGrid} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c9963d" strokeWidth="0.7" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#g)" />
                </svg>
                <div className={styles.heroGlow1} />
                <div className={styles.heroGlow2} />
                <div className={styles.heroLine} style={{ left: "20%" }} />
                <div className={styles.heroLine} style={{ right: "20%" }} />

                <div className={styles.heroInner}>
                    <div className={styles.heroCopy}>
                        <div className={styles.heroEyebrow}>
                            <div className={styles.heroEyebrowDot} />
                            <span className={styles.heroEyebrowText}>Now live in Kenyan schools</span>
                        </div>
                        <h1 className={styles.heroTitle}>
                            The calmer way to<br />
                            run a <em>whole school.</em>
                        </h1>
                        <p className={styles.heroSub}>
                            Elimu Pro brings class management, marks entry, parent communication, and leadership oversight into one elegant system — built for how Kenyan schools actually work.
                        </p>
                        <div className={styles.heroActions}>
                            <a href="#pricing" className={styles.btnPrimary}>
                                Get started free
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                            <a href="#features" className={styles.btnSecondary}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="10 8 16 12 10 16 10 8" />
                                </svg>
                                Watch demo
                            </a>
                        </div>
                        <div className={styles.heroTrust}>
                            <div className={styles.heroTrustAvatars}>
                                <div className={styles.heroTrustAvatar} style={{ background: "#1D9E75" }}>JM</div>
                                <div className={styles.heroTrustAvatar} style={{ background: "#BA7517" }}>PO</div>
                                <div className={styles.heroTrustAvatar} style={{ background: "#185FA5" }}>AK</div>
                                <div className={styles.heroTrustAvatar} style={{ background: "#993C1D" }}>GN</div>
                                <div className={styles.heroTrustAvatar} style={{ background: "#993556" }}>+</div>
                            </div>
                            <p className={styles.heroTrustText}>Trusted by <strong>240+ schools</strong> across Kenya</p>
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.heroCardFloat}>
                            <div className={styles.heroCardBar}>
                                <div className={styles.heroCardDots}>
                                    <div className={styles.heroCardDot} style={{ background: "#ef4444" }} />
                                    <div className={styles.heroCardDot} style={{ background: "#f59e0b" }} />
                                    <div className={styles.heroCardDot} style={{ background: "#22c55e" }} />
                                </div>
                                <span className={styles.heroCardTitle}>Elimu Pro · Class Teacher Hub</span>
                            </div>
                            <div className={styles.heroCardBody}>
                                <div className={styles.heroMetricRow}>
                                    <div className={styles.heroMetric}>
                                        <div className={styles.heroMetricLabel}>Students</div>
                                        <div className={styles.heroMetricVal}>35</div>
                                        <div className={styles.heroMetricNote}>Grade 7A</div>
                                    </div>
                                    <div className={styles.heroMetric}>
                                        <div className={styles.heroMetricLabel}>Subjects</div>
                                        <div className={styles.heroMetricVal}>5</div>
                                        <div className={styles.heroMetricNote}>All covered</div>
                                    </div>
                                    <div className={styles.heroMetric}>
                                        <div className={styles.heroMetricLabel}>Avg score</div>
                                        <div className={`${styles.heroMetricVal} ${styles.goldText}`}>76%</div>
                                        <div className={styles.heroMetricNote}>Term 1</div>
                                    </div>
                                    <div className={styles.heroMetric}>
                                        <div className={styles.heroMetricLabel}>Reports</div>
                                        <div className={`${styles.heroMetricVal} ${styles.greenText}`}>85%</div>
                                        <div className={styles.heroMetricNote}>Ready</div>
                                    </div>
                                </div>
                                <div className={styles.heroBars}>
                                    <div className={styles.heroBarRow}>
                                        <span className={styles.heroBarLabel}>Mathematics</span>
                                        <div className={styles.heroBarTrack}>
                                            <div className={styles.heroBarFill} data-w="82%" style={{ background: "#3b6d11" }} />
                                        </div>
                                        <span className={styles.heroBarVal}>82%</span>
                                    </div>
                                    <div className={styles.heroBarRow}>
                                        <span className={styles.heroBarLabel}>English</span>
                                        <div className={styles.heroBarTrack}>
                                            <div className={styles.heroBarFill} data-w="74%" style={{ background: "#C9963D" }} />
                                        </div>
                                        <span className={styles.heroBarVal}>74%</span>
                                    </div>
                                    <div className={styles.heroBarRow}>
                                        <span className={styles.heroBarLabel}>Science</span>
                                        <div className={styles.heroBarTrack}>
                                            <div className={styles.heroBarFill} data-w="71%" style={{ background: "#854f0b" }} />
                                        </div>
                                        <span className={styles.heroBarVal}>71%</span>
                                    </div>
                                    <div className={styles.heroBarRow}>
                                        <span className={styles.heroBarLabel}>Kiswahili</span>
                                        <div className={styles.heroBarTrack}>
                                            <div className={styles.heroBarFill} data-w="79%" style={{ background: "#3b6d11" }} />
                                        </div>
                                        <span className={styles.heroBarVal}>79%</span>
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.heroTableRow}>
                                        <div className={styles.heroAv} style={{ background: "#1D9E75" }}>EM</div>
                                        <span className={styles.heroRowName}>Emma Mwangi</span>
                                        <span className={`${styles.heroRowTag} ${styles.tagGreen}`}>A · 88%</span>
                                    </div>
                                    <div className={styles.heroTableRow}>
                                        <div className={styles.heroAv} style={{ background: "#185FA5" }}>JO</div>
                                        <span className={styles.heroRowName}>James Otieno</span>
                                        <span className={`${styles.heroRowTag} ${styles.tagGold}`}>B · 77%</span>
                                    </div>
                                    <div className={styles.heroTableRow}>
                                        <div className={styles.heroAv} style={{ background: "#993C1D" }}>AH</div>
                                        <span className={styles.heroRowName}>Aisha Hassan</span>
                                        <span className={`${styles.heroRowTag} ${styles.tagGreen}`}>A · 82%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.badgeFloat} ${styles.badgeFloat1}`}>
                            <div className={styles.badgeIcon}>📊</div>
                            <div className={styles.badgeVal}>+18%</div>
                            <div className={styles.badgeSub}>Score improvement</div>
                        </div>
                        <div className={`${styles.badgeFloat} ${styles.badgeFloat2}`}>
                            <div className={styles.badgeIcon}>✅</div>
                            <div className={styles.badgeVal}>240</div>
                            <div className={styles.badgeSub}>Schools active</div>
                        </div>
                        <div className={`${styles.badgeFloat} ${styles.badgeFloat3}`}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className={styles.pulseDot} />
                                <span className={styles.badgeText}>Reports ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee Section */}
            <div className={styles.marqueeSection}>
                <div className={styles.marqueeTrack}>
                    {["Class Management", "Marks Entry", "Parent Communication", "Performance Analytics", "Teacher Management", "Report Generation", "Role-based Access", "Subject Assignments"].map((item, i) => (
                        <div className={styles.marqueeItem} key={i}>
                            <div className={styles.marqueeDot} />
                            <span className={styles.marqueeText}>{item}</span>
                        </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {["Class Management", "Marks Entry", "Parent Communication", "Performance Analytics", "Teacher Management", "Report Generation", "Role-based Access", "Subject Assignments"].map((item, i) => (
                        <div className={styles.marqueeItem} key={`dup-${i}`}>
                            <div className={styles.marqueeDot} />
                            <span className={styles.marqueeText}>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <section className={`${styles.section} ${styles.featuresSection}`} id="features">
                <div className={styles.sectionInner}>
                    <div className={`${styles.reveal} ${styles.textCenter}`} style={{ marginBottom: 0 }}>
                        <div className={styles.sectionEyebrow}>Built for the whole school</div>
                        <h2 className={styles.sectionTitle}>Every tool your school <em>needs.</em></h2>
                        <p className={styles.sectionSub} style={{ margin: "16px auto 0" }}>From the head teacher's office to every classroom — one platform that keeps everyone aligned without the chaos.</p>
                    </div>
                    <div className={styles.featuresGrid}>
                        <div className={`${styles.featCard} ${styles.reveal}`} style={{ transitionDelay: "0.05s" }}>
                            <div className={styles.featIcon} style={{ background: "#e8f0fb" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a4a99" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                            </div>
                            <h3 className={styles.featTitle}>Smart class management</h3>
                            <p className={styles.featDesc}>Assign class teachers to streams, manage student rosters, and track attendance — all from one clean interface that updates in real time.</p>
                            <a href="#" className={styles.featLink}>Explore feature <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                        </div>
                        <div className={`${styles.featCard} ${styles.reveal}`} style={{ transitionDelay: "0.1s" }}>
                            <div className={styles.featIcon} style={{ background: "#eaf3de" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b6d11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                </svg>
                            </div>
                            <h3 className={styles.featTitle}>Marks entry & grading</h3>
                            <p className={styles.featDesc}>Subject teachers enter marks directly, class teachers review and approve, and reports are generated automatically — no spreadsheets needed.</p>
                            <a href="#" className={styles.featLink}>Explore feature <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                        </div>
                        <div className={`${styles.featCard} ${styles.reveal}`} style={{ transitionDelay: "0.15s" }}>
                            <div className={styles.featIcon} style={{ background: "#f5ead4" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 20V10M12 20V4M6 20v-6" />
                                </svg>
                            </div>
                            <h3 className={styles.featTitle}>Performance analytics</h3>
                            <p className={styles.featDesc}>Track class averages, subject performance, and student progress with visual dashboards that surface the insights you actually need for decisions.</p>
                            <a href="#" className={styles.featLink}>Explore feature <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                        </div>
                        <div className={`${styles.featCard} ${styles.reveal}`} style={{ transitionDelay: "0.2s" }}>
                            <div className={styles.featIcon} style={{ background: "#faeeda" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854f0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h3 className={styles.featTitle}>Parent communication</h3>
                            <p className={styles.featDesc}>Log parent concerns, track response timelines, and maintain a clean record of every family interaction — so nothing falls through the cracks.</p>
                            <a href="#" className={styles.featLink}>Explore feature <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                        </div>
                        <div className={`${styles.featCard} ${styles.reveal}`} style={{ transitionDelay: "0.25s" }}>
                            <div className={styles.featIcon} style={{ background: "#fcebeb" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a32d2d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <path d="M14 2v6h6" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <h3 className={styles.featTitle}>One-click reports</h3>
                            <p className={styles.featDesc}>Generate individual result slips, class summaries, and leadership packs in PDF or Excel — ready to print or send in seconds, not hours.</p>
                            <a href="#" className={styles.featLink}>Explore feature <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                        </div>
                        <div className={`${styles.featCard} ${styles.reveal}`} style={{ transitionDelay: "0.3s" }}>
                            <div className={styles.featIcon} style={{ background: "#0B2018" }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 className={styles.featTitle}>Role-based access</h3>
                            <p className={styles.featDesc}>Super admin, admin, head teacher, deputy, class teacher, and subject teacher — each role sees exactly what they need and nothing they don't.</p>
                            <a href="#" className={styles.featLink}>Explore feature <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section className={`${styles.section} ${styles.rolesSection}`} id="roles">
                <svg className={styles.rolesSectionGrid} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="rg" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c9963d" strokeWidth=".7" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#rg)" />
                </svg>
                <div className={styles.sectionInner}>
                    <div className={`${styles.reveal} ${styles.rolesHeader}`}>
                        <div className={styles.sectionEyebrow}>Tailored access</div>
                        <h2 className={styles.sectionTitle}>Built for <em>every role</em> in your school.</h2>
                        <p className={styles.sectionSub}>Six distinct dashboards, each fine-tuned to what that person actually does every day.</p>
                    </div>
                    <div className={`${styles.reveal} ${styles.rolesTabs}`}>
                        <button className={`${styles.roleTab} ${activeRole === "admin" ? styles.active : ""}`} onClick={() => switchRole("admin")}>Admin</button>
                        <button className={`${styles.roleTab} ${activeRole === "head" ? styles.active : ""}`} onClick={() => switchRole("head")}>Head Teacher</button>
                        <button className={`${styles.roleTab} ${activeRole === "deputy" ? styles.active : ""}`} onClick={() => switchRole("deputy")}>Deputy Head</button>
                        <button className={`${styles.roleTab} ${activeRole === "class" ? styles.active : ""}`} onClick={() => switchRole("class")}>Class Teacher</button>
                        <button className={`${styles.roleTab} ${activeRole === "subject" ? styles.active : ""}`} onClick={() => switchRole("subject")}>Subject Teacher</button>
                    </div>

                    {/* Admin Role */}
                    <div className={`${styles.roleContent} ${activeRole === "admin" ? styles.active : ""}`} id="role-admin">
                        <div className={styles.revealLeft}>
                            <div className={styles.roleInfoTag}><span>Administrator</span></div>
                            <h3 className={styles.roleTitle}>Total control over school structure.</h3>
                            <p className={styles.roleDesc}>The admin sets up and maintains the school's entire configuration — from adding classes and subjects to assigning every teacher to their rightful place.</p>
                            <div className={styles.rolePerms}>
                                {["Add, edit, and remove classes and streams", "Assign class teachers and subject teachers", "Manage the full teacher directory", "Register and configure all school subjects"].map((perm, i) => (
                                    <div key={i} className={styles.rolePerm}>
                                        <div className={styles.rolePermIcon}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 11l3 3L22 4" />
                                            </svg>
                                        </div>
                                        <span className={styles.rolePermText}>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.revealRight}>
                            <div className={styles.roleVisual}>
                                <div className={styles.roleUiCard}>
                                    <div className={styles.roleUiHeader}>
                                        <div className={styles.roleUiDots}>
                                            <div className={styles.roleUiDot} style={{ background: "#ef4444" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#f59e0b" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#22c55e" }} />
                                        </div>
                                        <span className={styles.roleUiTitle}>Admin Portal · Class management</span>
                                    </div>
                                    <div className={styles.roleUiBody}>
                                        <div className={styles.adminMetrics}>
                                            <div className={styles.adminMetric}><p>Classes</p><p className={styles.adminMetricValue}>6</p></div>
                                            <div className={styles.adminMetric}><p>Subjects</p><p className={styles.adminMetricValue}>8</p></div>
                                            <div className={styles.adminMetric}><p>Staff</p><p className={styles.adminMetricValue}>8</p></div>
                                        </div>
                                        <div className={styles.classRoster}>
                                            <div className={styles.classRosterHeader}>
                                                <span>Class roster</span>
                                                <span>All assigned ✓</span>
                                            </div>
                                            <div className={styles.classRosterItem}>
                                                <div className={styles.classRosterAvatar} style={{ background: "#1D9E75" }}>PE</div>
                                                <span>Grade 7A</span>
                                                <span>Peter Otieno</span>
                                            </div>
                                            <div className={styles.classRosterItem}>
                                                <div className={styles.classRosterAvatar} style={{ background: "#3B6D11" }}>JM</div>
                                                <span>Grade 8A</span>
                                                <span>John Mwangi</span>
                                            </div>
                                            <div className={styles.classRosterItem}>
                                                <div className={styles.classRosterAvatar} style={{ background: "#993556" }}>GN</div>
                                                <span>Grade 9B</span>
                                                <span>Grace Njeri</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Head Teacher Role */}
                    <div className={`${styles.roleContent} ${activeRole === "head" ? styles.active : ""}`} id="role-head">
                        <div className={styles.revealLeft}>
                            <div className={styles.roleInfoTag}><span>Head Teacher</span></div>
                            <h3 className={styles.roleTitle}>Whole-school leadership at a glance.</h3>
                            <p className={styles.roleDesc}>The head teacher sees the full operational picture — staff, learners, analytics, and reports — without getting lost in the day-to-day minutiae.</p>
                            <div className={styles.rolePerms}>
                                {["Full school performance dashboard", "Access to leadership reports and summaries", "Staff management and oversight", "Parent concern management and follow-up"].map((perm, i) => (
                                    <div key={i} className={styles.rolePerm}>
                                        <div className={styles.rolePermIcon}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 11l3 3L22 4" />
                                            </svg>
                                        </div>
                                        <span className={styles.rolePermText}>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.revealRight}>
                            <div className={styles.roleVisual}>
                                <div className={styles.roleUiCard}>
                                    <div className={styles.roleUiHeader}>
                                        <div className={styles.roleUiDots}>
                                            <div className={styles.roleUiDot} style={{ background: "#ef4444" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#f59e0b" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#22c55e" }} />
                                        </div>
                                        <span className={styles.roleUiTitle}>Leadership Hub · Analytics</span>
                                    </div>
                                    <div className={styles.roleUiBody}>
                                        {[
                                            ["Grade 7A", "78%", "#3b6d11"],
                                            ["Grade 8A", "81%", "#3b6d11"],
                                            ["Grade 8B", "69%", "#854f0b"],
                                            ["Grade 9A", "76%", "#C9963D"],
                                            ["Grade 9B", "83%", "#3b6d11"],
                                        ].map(([c, v, col]) => (
                                            <div key={c} className={styles.performanceRow}>
                                                <span>{c}</span>
                                                <div className={styles.performanceBar}>
                                                    <div className={styles.performanceFill} style={{ width: v, background: col }} />
                                                </div>
                                                <span style={{ color: col }}>{v}</span>
                                            </div>
                                        ))}
                                        <div className={styles.statsRow}>
                                            <div className={styles.statsBoxGreen}><p>5/6</p><p>Staff active</p></div>
                                            <div className={styles.statsBoxRed}><p>2</p><p>Open concerns</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deputy Role */}
                    <div className={`${styles.roleContent} ${activeRole === "deputy" ? styles.active : ""}`} id="role-deputy">
                        <div className={styles.revealLeft}>
                            <div className={styles.roleInfoTag}><span>Deputy Head Teacher</span></div>
                            <h3 className={styles.roleTitle}>Academic support without the noise.</h3>
                            <p className={styles.roleDesc}>The deputy focuses on academic coordination — tracking class performance, supporting teachers, and managing parent interactions across the school.</p>
                            <div className={styles.rolePerms}>
                                {["Class and student management view", "Analytics across all streams", "Parent concern tracking and response", "Teacher workload monitoring"].map((perm, i) => (
                                    <div key={i} className={styles.rolePerm}>
                                        <div className={styles.rolePermIcon}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 11l3 3L22 4" />
                                            </svg>
                                        </div>
                                        <span className={styles.rolePermText}>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.revealRight}>
                            <div className={styles.roleVisual}>
                                <div className={styles.roleUiCard}>
                                    <div className={styles.roleUiHeader}>
                                        <div className={styles.roleUiDots}>
                                            <div className={styles.roleUiDot} style={{ background: "#ef4444" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#f59e0b" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#22c55e" }} />
                                        </div>
                                        <span className={styles.roleUiTitle}>Leadership Hub · Parent Concerns</span>
                                    </div>
                                    <div className={styles.roleUiBody}>
                                        {[
                                            ["Mr. John Mwangi", "Emma Mwangi · Grade 7A", "Grade review requested", "High", "Open"],
                                            ["Mrs. N. Njeri", "Cynthia Achieng · Grade 9A", "Counselling support request", "High", "Pending"],
                                            ["Mr. K. Kimutai", "Brian Kipchoge · Grade 8B", "Attendance discrepancy", "Medium", "Open"],
                                        ].map(([p, s, i, pr, st], idx) => (
                                            <div key={idx} className={styles.concernCard}>
                                                <div className={styles.concernHeader}>
                                                    <span>{p}</span>
                                                    <div className={styles.concernBadges}>
                                                        <span className={`${styles.badgeRed} ${styles.badgePill}`}>{pr}</span>
                                                        <span className={`${styles.badgeRed} ${styles.badgePill}`}>{st}</span>
                                                    </div>
                                                </div>
                                                <p>{s}</p>
                                                <p>{i}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Class Teacher Role */}
                    <div className={`${styles.roleContent} ${activeRole === "class" ? styles.active : ""}`} id="role-class">
                        <div className={styles.revealLeft}>
                            <div className={styles.roleInfoTag}><span>Class Teacher</span></div>
                            <h3 className={styles.roleTitle}>Everything your stream needs, in one place.</h3>
                            <p className={styles.roleDesc}>The class teacher manages their assigned stream end-to-end — student records, marks review, result downloads, and class-level performance tracking.</p>
                            <div className={styles.rolePerms}>
                                {["Full student roster and profile management", "Review and approve marks from subject teachers", "Download result slips and class reports", "Class-level performance analytics"].map((perm, i) => (
                                    <div key={i} className={styles.rolePerm}>
                                        <div className={styles.rolePermIcon}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 11l3 3L22 4" />
                                            </svg>
                                        </div>
                                        <span className={styles.rolePermText}>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.revealRight}>
                            <div className={styles.roleVisual}>
                                <div className={styles.roleUiCard}>
                                    <div className={styles.roleUiHeader}>
                                        <div className={styles.roleUiDots}>
                                            <div className={styles.roleUiDot} style={{ background: "#ef4444" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#f59e0b" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#22c55e" }} />
                                        </div>
                                        <span className={styles.roleUiTitle}>Class Teacher Hub · Student Records</span>
                                    </div>
                                    <div className={styles.roleUiBody}>
                                        {[
                                            ["Emma Mwangi", "#1D9E75", "88%", "#3b6d11"],
                                            ["James Otieno", "#185FA5", "77%", "#C9963D"],
                                            ["Aisha Hassan", "#993C1D", "82%", "#3b6d11"],
                                            ["Brian Kipchoge", "#BA7517", "65%", "#854f0b"],
                                        ].map(([n, bg, avg, ac]) => (
                                            <div key={n} className={styles.studentRow}>
                                                <div className={styles.studentAvatar} style={{ background: bg }}>{n.split(" ").map(p => p[0]).join("").slice(0, 2)}</div>
                                                <span>{n}</span>
                                                <div className={styles.studentBar}>
                                                    <div className={styles.studentFill} style={{ width: avg, background: ac }} />
                                                </div>
                                                <span style={{ color: ac }}>{avg}</span>
                                            </div>
                                        ))}
                                        <div className={styles.classStatsRow}>
                                            <div className={styles.classStat}><p>76%</p><p>Class avg</p></div>
                                            <div className={styles.classStatGold}><p>85%</p><p>Readiness</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subject Teacher Role */}
                    <div className={`${styles.roleContent} ${activeRole === "subject" ? styles.active : ""}`} id="role-subject">
                        <div className={styles.revealLeft}>
                            <div className={styles.roleInfoTag}><span>Subject Teacher</span></div>
                            <h3 className={styles.roleTitle}>Focus on teaching. We handle the rest.</h3>
                            <p className={styles.roleDesc}>Subject teachers enter marks for their assigned classes, track student progress per subject, and push results directly to the class teacher for review.</p>
                            <div className={styles.rolePerms}>
                                {["View all assigned subjects and classes", "Enter and edit student marks per class", "Push marks to class teacher for approval", "Track subject performance by class"].map((perm, i) => (
                                    <div key={i} className={styles.rolePerm}>
                                        <div className={styles.rolePermIcon}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 11l3 3L22 4" />
                                            </svg>
                                        </div>
                                        <span className={styles.rolePermText}>{perm}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.revealRight}>
                            <div className={styles.roleVisual}>
                                <div className={styles.roleUiCard}>
                                    <div className={styles.roleUiHeader}>
                                        <div className={styles.roleUiDots}>
                                            <div className={styles.roleUiDot} style={{ background: "#ef4444" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#f59e0b" }} />
                                            <div className={styles.roleUiDot} style={{ background: "#22c55e" }} />
                                        </div>
                                        <span className={styles.roleUiTitle}>Subject Teacher · Mathematics</span>
                                    </div>
                                    <div className={styles.roleUiBody}>
                                        <div className={styles.subjectClasses}>
                                            <div className={styles.subjectHeader}>
                                                <span>My classes</span>
                                                <span>3 active</span>
                                            </div>
                                            {[
                                                ["Grade 7A", "35 students", "81%", "#3b6d11"],
                                                ["Grade 8B", "32 students", "74%", "#C9963D"],
                                                ["Grade 9A", "30 students", "79%", "#3b6d11"],
                                            ].map(([c, s, avg, col]) => (
                                                <div key={c} className={styles.subjectClassCard}>
                                                    <div className={styles.subjectClassHeader}>
                                                        <span>{c}</span>
                                                        <span style={{ color: col }}>{avg}</span>
                                                    </div>
                                                    <div className={styles.subjectClassFooter}>
                                                        <span>{s}</span>
                                                        <button className={styles.enterMarksBtn}>Enter marks</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button className={styles.pushMarksBtn}>Push marks to class teacher</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={`${styles.section} ${styles.statsSection}`}>
                <div className={styles.statsDivider} />
                <div className={styles.sectionInner}>
                    <div className={`${styles.reveal} ${styles.textCenter}`}>
                        <div className={styles.sectionEyebrow}>By the numbers</div>
                        <h2 className={styles.sectionTitle}>Real results across <em>real schools.</em></h2>
                    </div>
                    <div className={styles.statsGrid}>
                        <div className={`${styles.statCell} ${styles.reveal}`} style={{ transitionDelay: "0.05s" }}>
                            <div className={styles.statNumber}>240+</div>
                            <div className={styles.statLabel}>Schools onboarded</div>
                            <div className={styles.statSub}>Across 14 counties</div>
                        </div>
                        <div className={`${styles.statCell} ${styles.reveal}`} style={{ transitionDelay: "0.1s" }}>
                            <div className={styles.statNumber}>48K+</div>
                            <div className={styles.statLabel}>Students managed</div>
                            <div className={styles.statSub}>Active this term</div>
                        </div>
                        <div className={`${styles.statCell} ${styles.reveal}`} style={{ transitionDelay: "0.15s" }}>
                            <div className={styles.statNumber}>1.2M+</div>
                            <div className={styles.statLabel}>Reports generated</div>
                            <div className={styles.statSub}>Result slips & summaries</div>
                        </div>
                        <div className={`${styles.statCell} ${styles.reveal}`} style={{ transitionDelay: "0.2s" }}>
                            <div className={styles.statNumber}>98%</div>
                            <div className={styles.statLabel}>Customer satisfaction</div>
                            <div className={styles.statSub}>From term-end surveys</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className={`${styles.section} ${styles.howSection}`} id="how">
                <div className={styles.sectionInner}>
                    <div className={`${styles.reveal} ${styles.textCenter}`}>
                        <div className={styles.sectionEyebrow}>Getting started</div>
                        <h2 className={styles.sectionTitle}>Up and running in <em>three steps.</em></h2>
                        <p className={styles.sectionSub} style={{ margin: "16px auto 0" }}>No lengthy onboarding. No IT department required. Your school is operational the same day you sign up.</p>
                    </div>
                    <div className={styles.howSteps}>
                        <div className={`${styles.howStep} ${styles.reveal}`} style={{ transitionDelay: "0.05s" }}>
                            <div className={styles.howStepNum}>01</div>
                            <div className={styles.howStepIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 className={styles.howStepTitle}>Set up your school</h3>
                            <p className={styles.howStepDesc}>An admin adds your classes, subjects, and teacher directory. Assign class teachers and subject teachers to each stream in minutes.</p>
                        </div>
                        <div className={`${styles.howStep} ${styles.reveal}`} style={{ transitionDelay: "0.15s" }}>
                            <div className={styles.howStepNum}>02</div>
                            <div className={styles.howStepIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                            </div>
                            <h3 className={styles.howStepTitle}>Everyone gets their role</h3>
                            <p className={styles.howStepDesc}>Each person logs in to their own tailored dashboard. Head teacher, deputy, class teacher, subject teacher — everyone sees exactly what they need.</p>
                        </div>
                        <div className={`${styles.howStep} ${styles.reveal}`} style={{ transitionDelay: "0.25s" }}>
                            <div className={styles.howStepNum}>03</div>
                            <div className={styles.howStepIcon}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                            </div>
                            <h3 className={styles.howStepTitle}>Marks in, reports out</h3>
                            <p className={styles.howStepDesc}>Subject teachers enter marks, class teachers review and approve, and leadership downloads reports — all without a single spreadsheet or paper form.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className={`${styles.section} ${styles.testimonialsSection}`}>
                <div className={styles.sectionInner}>
                    <div className={`${styles.reveal} ${styles.textCenter}`}>
                        <div className={styles.sectionEyebrow}>What schools say</div>
                        <h2 className={styles.sectionTitle}>Trusted by educators <em>who know.</em></h2>
                        <p className={styles.sectionSub} style={{ margin: "16px auto 0" }}>Real feedback from head teachers, class teachers, and deputies who use Elimu Pro every term.</p>
                    </div>
                    <div className={styles.testimonialsGrid}>
                        <div className={`${styles.testiCard} ${styles.reveal}`} style={{ transitionDelay: "0.05s" }}>
                            <div className={styles.testiStars}>★★★★★</div>
                            <div className={styles.testiQuote}>Elimu Pro has transformed how we run reports. What used to take our staff three days at the end of term now takes two hours. The class teacher dashboard is particularly well thought out.</div>
                            <div className={styles.testiAuthor}>
                                <div className={styles.testiAv} style={{ background: "#1D9E75" }}>JN</div>
                                <div>
                                    <div className={styles.testiName}>Mrs. Janet Njoroge</div>
                                    <div className={styles.testiRole}>Head Teacher, Starehe Girls Centre, Nairobi</div>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.testiCard} ${styles.reveal}`} style={{ transitionDelay: "0.1s" }}>
                            <div className={styles.testiStars}>★★★★★</div>
                            <div className={styles.testiQuote}>As a deputy, I was always chasing teachers for marks. Now everything flows automatically from subject teacher to class teacher to my overview. The parent concern tracker alone is worth it.</div>
                            <div className={styles.testiAuthor}>
                                <div className={styles.testiAv} style={{ background: "#185FA5" }}>PK</div>
                                <div>
                                    <div className={styles.testiName}>Mr. Paul Kamau</div>
                                    <div className={styles.testiRole}>Deputy Head, Alliance High School, Kikuyu</div>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.testiCard} ${styles.reveal}`} style={{ transitionDelay: "0.15s" }}>
                            <div className={styles.testiStars}>★★★★★</div>
                            <div className={styles.testiQuote}>I teach Mathematics across four streams. Being able to enter marks for each class, see performance per stream, and push everything to the class teacher — all from my phone — is remarkable.</div>
                            <div className={styles.testiAuthor}>
                                <div className={styles.testiAv} style={{ background: "#BA7517" }}>AO</div>
                                <div>
                                    <div className={styles.testiName}>Mr. Andrew Ochieng</div>
                                    <div className={styles.testiRole}>Subject Teacher, Kisumu Boys High School</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className={`${styles.section} ${styles.pricingSection}`} id="pricing">
                <div className={styles.sectionInner}>
                    <div className={`${styles.reveal} ${styles.textCenter}`}>
                        <div className={styles.sectionEyebrow}>Simple pricing</div>
                        <h2 className={styles.sectionTitle}>One price. <em>Whole school.</em></h2>
                        <p className={styles.sectionSub} style={{ margin: "16px auto 0" }}>No per-user fees, no hidden charges. Pick the plan that fits your school's size and get everyone onboarded in a day.</p>
                    </div>
                    <div className={styles.pricingGrid}>
                        <div className={`${styles.priceCard} ${styles.starter} ${styles.reveal}`} style={{ transitionDelay: "0.05s" }}>
                            <div className={`${styles.priceBadge} ${styles.starterB}`}>Starter</div>
                            <div className={styles.priceName}>Foundation</div>
                            <div className={styles.priceDesc}>For smaller schools getting started with digital management.</div>
                            <div className={styles.priceAmount}>
                                <span className={styles.priceCurrency}>KES</span>
                                <span className={styles.priceNumber}>12K</span>
                                <span className={styles.pricePeriod}>/term</span>
                            </div>
                            <div className={styles.priceFeatures}>
                                {["Up to 300 students", "All core dashboards", "Marks & report generation", "Email support"].map((feature, i) => (
                                    <div key={i} className={styles.priceFeature}>
                                        <div className={styles.priceCheck}>
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                            <a href="#" className={`${styles.priceBtn} ${styles.outline}`}>Get started</a>
                        </div>
                        <div className={`${styles.priceCard} ${styles.pro} ${styles.reveal}`} style={{ transitionDelay: "0.1s" }}>
                            <div className={`${styles.priceBadge} ${styles.popular}`}>Most popular</div>
                            <div className={styles.priceName}>Professional</div>
                            <div className={styles.priceDesc}>For growing schools that need the full leadership suite.</div>
                            <div className={styles.priceAmount}>
                                <span className={styles.priceCurrency}>KES</span>
                                <span className={styles.priceNumber}>28K</span>
                                <span className={styles.pricePeriod}>/term</span>
                            </div>
                            <div className={styles.priceFeatures}>
                                {["Up to 1,200 students", "All 6 role dashboards", "Analytics & leadership reports", "Parent concerns module", "Priority phone & email support"].map((feature, i) => (
                                    <div key={i} className={styles.priceFeature}>
                                        <div className={`${styles.priceCheck} ${styles.gold}`}>
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                            <a href="#" className={`${styles.priceBtn} ${styles.goldBtn}`}>Get started free →</a>
                        </div>
                        <div className={`${styles.priceCard} ${styles.enterprise} ${styles.reveal}`} style={{ transitionDelay: "0.15s" }}>
                            <div className={`${styles.priceBadge} ${styles.enterpriseB}`}>Enterprise</div>
                            <div className={styles.priceName}>Institution</div>
                            <div className={styles.priceDesc}>For large schools, multi-campus institutions, and county offices.</div>
                            <div className={styles.priceAmount}>
                                <span className={styles.priceCurrency}>KES</span>
                                <span className={styles.priceNumber}>Custom</span>
                            </div>
                            <div className={styles.priceFeatures}>
                                {["Unlimited students & staff", "Multi-campus support", "Custom integrations & API", "Dedicated account manager", "On-site training & onboarding"].map((feature, i) => (
                                    <div key={i} className={styles.priceFeature}>
                                        <div className={styles.priceCheck} style={{ background: "#0B2018" }}>
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C9963D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                            <a href="#" className={`${styles.priceBtn} ${styles.greenBtn}`}>Contact us</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={`${styles.section} ${styles.ctaSection}`}>
                <div className={styles.ctaInner}>
                    <div className={`${styles.ctaCard} ${styles.revealScale}`}>
                        <svg className={styles.ctaCardGrid} xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="cg" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c9963d" strokeWidth=".7" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#cg)" />
                        </svg>
                        <div className={styles.ctaGlow} />
                        <div className={styles.ctaFreeBadge}>
                            <div className={styles.freeDot} />
                            <span>Free for one full term</span>
                        </div>
                        <h2 className={styles.ctaTitle}>
                            Ready to run a calmer,<br />
                            <em>better-organised school?</em>
                        </h2>
                        <p className={styles.ctaSub}>Join 240+ schools already using Elimu Pro. Get your whole team set up in under a day — no IT background required.</p>
                        <div className={styles.ctaActions}>
                            <a href="#" className={`${styles.btnPrimary} ${styles.ctaPrimary}`}>
                                Start for free
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                            <a href="#" className={`${styles.btnSecondary} ${styles.ctaSecondary}`}>Book a demo call</a>
                        </div>
                        <p className={styles.ctaNote}>No credit card required · Cancel anytime · Full feature access from day one</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerTop}>
                        <div className={styles.footerBrand}>
                            <div className={styles.footerBrandLogo}>
                                <div className={styles.footerBrandBadge}>
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <span className={styles.footerBrandName}>Elimu Pro</span>
                            </div>
                            <p className={styles.footerBrandDesc}>The complete school management system built for Kenyan schools — from classroom to leadership office.</p>
                            <div className={styles.footerContact}>
                                <p><strong>Contact Developer:</strong> Carlos Technologies</p>
                                <p><strong>Phone:</strong> 0757475316</p>
                                <p><strong>Email:</strong> carlosmaina198@gmail.com</p>
                                <p><strong>Support:</strong> softwarewebdevelopers1@gmail.com</p>
                            </div>
                        </div>
                        <div>
                            <div className={styles.footerColTitle}>Product</div>
                            <div className={styles.footerLinks}>
                                <a href="#" className={styles.footerLink}>Features</a>
                                <a href="#" className={styles.footerLink}>How it works</a>
                                <a href="#" className={styles.footerLink}>Pricing</a>
                                <a href="#" className={styles.footerLink}>Changelog</a>
                                <a href="#" className={styles.footerLink}>Roadmap</a>
                            </div>
                        </div>
                        <div>
                            <div className={styles.footerColTitle}>Roles</div>
                            <div className={styles.footerLinks}>
                                <a href="#" className={styles.footerLink}>Administrator</a>
                                <a href="#" className={styles.footerLink}>Head Teacher</a>
                                <a href="#" className={styles.footerLink}>Deputy Head</a>
                                <a href="#" className={styles.footerLink}>Class Teacher</a>
                                <a href="#" className={styles.footerLink}>Subject Teacher</a>
                            </div>
                        </div>
                        <div>
                            <div className={styles.footerColTitle}>Company</div>
                            <div className={styles.footerLinks}>
                                <a href="#" className={styles.footerLink}>About us</a>
                                <a href="#" className={styles.footerLink}>Blog</a>
                                <a href="#" className={styles.footerLink}>Support</a>
                                <a href="#" className={styles.footerLink}>Privacy policy</a>
                                <a href="#" className={styles.footerLink}>Terms of service</a>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <span className={styles.footerCopy}>© 2024 Elimu Pro. Built with care for Kenyan schools by Carlos Technologies.</span>
                        <div className={styles.footerSocials}>
                            <div className={styles.footerSocial}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                </svg>
                            </div>
                            <div className={styles.footerSocial}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                                    <rect x="2" y="9" width="4" height="12" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </div>
                            <div className={styles.footerSocial}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;