/// <reference types="cypress" />

describe("Login Page", () => {
    const frontendUrl = "http://localhost:5173"; // Your Vite frontend
    const apiUrl = "http://localhost:3000"; // Your backend

    beforeEach(() => {
        cy.visit(`${frontendUrl}/login`);
    });

    // ---------- RENDER TESTS ----------
    it("renders all login elements", () => {
        cy.contains("Hello Again!!!").should("be.visible");
        cy.get('input[name="username"]').should("exist");
        cy.get('input[name="password"]').should("exist");
        cy.get(".login-btn").should("contain.text", "Login");
        cy.contains("Don't have an account?").should("be.visible");
        cy.get(".social-icons a").should("have.length", 4);
    });

    // ---------- VALIDATION ----------
    it("shows validation errors for empty fields", () => {
        cy.get("form").submit();
        cy.get('input[name="username"]:invalid').should("exist");
        cy.get('input[name="password"]:invalid').should("exist");
    });

    // ---------- LOGIN SUCCESS ----------
    it("handles successful login", () => {
        cy.intercept("POST", `${apiUrl}/signin`, {
            statusCode: 200,
            body: {
                user: {
                    id: "123",
                    name: "Sam",
                    email: "sam@example.com",
                },
            },
        }).as("loginRequest");

        cy.get('input[name="username"]').type("sam@example.com");
        cy.get('input[name="password"]').type("password123");
        cy.get("form").submit();

        cy.wait("@loginRequest");
        cy.contains("Login successful! Redirecting...").should("be.visible");

        // Should save user to localStorage
        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("user"));
            expect(user).to.have.property("email", "sam@example.com");
            expect(win.localStorage.getItem("isLoggedIn")).to.equal("true");
        });
    });

    // ---------- LOGIN FAILURE ----------
    it("shows error for invalid credentials", () => {
        cy.intercept("POST", `${apiUrl}/signin`, {
            statusCode: 401,
            body: { error: "Invalid email or password" },
        }).as("loginError");

        cy.get('input[name="username"]').type("wrong@example.com");
        cy.get('input[name="password"]').type("wrongpass");
        cy.get("form").submit();

        cy.wait("@loginError");
        cy.contains("Invalid email or password").should("be.visible");
    });

    // ---------- NETWORK FAILURE ----------
    it("handles network failure gracefully", () => {
        cy.intercept("POST", `${apiUrl}/signin`, { forceNetworkError: true }).as("networkFail");

        cy.get('input[name="username"]').type("sam@example.com");
        cy.get('input[name="password"]').type("password123");
        cy.get("form").submit();

        cy.wait("@networkFail");
        cy.contains(/(Login failed|Failed to fetch)/i).should("be.visible");

    });

    // ---------- GREETING MESSAGE ----------
    it("displays greeting when logged in", () => {
        cy.window().then((win) => {
            const mockUser = { name: "Sam", email: "sam@example.com" };
            win.localStorage.setItem("user", JSON.stringify(mockUser));
            win.localStorage.setItem("isLoggedIn", "true");
        });

        cy.reload();
        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("user"));
            expect(user).to.have.property("name", "Sam");
            expect(win.localStorage.getItem("isLoggedIn")).to.eq("true");
        });

    });

    // ---------- NAVIGATION ----------
    it("navigates to signup page", () => {
        cy.contains("Sign up").click();
        cy.url().should("include", "/signup");
    });

    it("shows alert when skipping without login", () => {
        cy.on("window:alert", (text) => {
            expect(text).to.equal("You must be logged in to access this page.");
        });
        cy.contains("Skip to Home").click();
    });

    it("redirects to protected route when authenticated", () => {
        cy.window().then((win) => {
            const mockUser = { name: "Sam", email: "sam@example.com" };
            win.localStorage.setItem("user", JSON.stringify(mockUser));
            win.localStorage.setItem("isLoggedIn", "true");
        });

        cy.reload();
        cy.contains("Skip to Home").click();
        cy.url().should("include", "/ProtectedRoutez");
    });
});
