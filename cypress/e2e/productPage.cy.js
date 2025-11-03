/// <reference types="cypress" />

describe("Product Page (Frontend Only)", () => {
    const frontendUrl = "http://localhost:5173"; // Vite dev server
    const apiUrl = "http://localhost:3000";

    const mockProducts = [
        { _id: "1", name: "Solar Panel Tiger 590W Neo N type", price: 2200, imageUrl: "https://www.sustainable.co.za/cdn/shop/files/JinkoTigerNeo590WTOPConN-TypeMonoSolarPanel.jpg?v=1738351585&width=1080" },
        { _id: "2", name: "Ryobi RG-950 Generator 950W", price: 3000, imageUrl: "data:image/jpeg;base64,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" },
        { _id: "3", name: "Mecer Trolley Inverter Black 2000W", price: 2800, imageUrl: "data:image/jpeg;base64,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" },
    ];

    beforeEach(() => {
        // mock user login
        const user = { name: "Sam", email: "sam@example.com" };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");

        // intercept API
        cy.intercept("GET", `${apiUrl}/products`, {
            statusCode: 200,
            body: { data: mockProducts },
        }).as("getProducts");

        cy.visit(`${frontendUrl}/ProductPage`);
        cy.wait("@getProducts");
    });

    // ---------- RENDER ----------
    it("renders navbar and product list", () => {
        cy.get(".navbar").should("exist").scrollIntoView();
        cy.contains("PWS Products").should("be.visible");
        cy.get(".product-card").should("have.length", 3);
    });


    // ---------- SEARCH ----------
    it("filters products with search bar", () => {
        cy.get(".searchbar input")
            .scrollIntoView()
            .should("exist")
            .type("Panel", { force: true });
        cy.wait(400);
        cy.get(".product-card").should("have.length", 1);
        cy.contains("Solar Panel").should("be.visible");

    });

    // ---------- CART ----------
    it("adds products to cart and persists to localStorage", () => {
        cy.get(".product-card").first().within(() => {
            cy.contains("Add to Cart").click();
            cy.contains("In Cart (Qty: 1)").should("be.visible");
        });

        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("user"));
            const cart = JSON.parse(win.localStorage.getItem(`cart_${user.email}`));
            expect(cart).to.have.length(1);
            expect(cart[0].name).to.equal("Solar Panel Tiger 590W Neo N type");
        });
    });

    // ---------- WISHLIST ----------
    it("adds and removes product from wishlist", () => {
        cy.get(".product-card").eq(1).within(() => {
            cy.contains("♡ Wishlist").click();
            cy.contains("♥ Remove").should("be.visible");
        });

        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("user"));
            const wishlist = JSON.parse(win.localStorage.getItem(`wishlist_${user.email}`));
            expect(wishlist).to.have.length(1);
        });

        // remove from wishlist
        cy.get(".product-card").eq(1).within(() => {
            cy.contains("♥ Remove").click();
            cy.contains("♡ Wishlist").should("be.visible");
        });

        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("user"));
            const wishlist = JSON.parse(win.localStorage.getItem(`wishlist_${user.email}`));
            expect(wishlist).to.have.length(0);
        });
    });

    // ---------- LOGOUT ----------
    it("logs out and redirects to login", () => {
        cy.contains("Logout").click();
        cy.url().should("include", "/login");
        cy.window().then((win) => {
            expect(win.localStorage.getItem("user")).to.be.null;
            expect(win.localStorage.getItem("isLoggedIn")).to.be.null;
        });
    });

    // ---------- ERROR HANDLING ----------
    it("shows error message when products API fails", () => {
        cy.intercept("GET", `${apiUrl}/products`, {
            statusCode: 500,
            body: "Internal Server Error",
        }).as("errorProducts");

        cy.visit(`${frontendUrl}/ProductPage`);
        cy.wait("@errorProducts");
        cy.contains("Failed to fetch products").should("be.visible");
    });

    // ---------- NO RESULTS ----------
    it("shows 'No products found' when search has no matches", () => {
        cy.get('.searchbar input').scrollIntoView().type('nonexistent', { force: true });
        cy.wait(400);
        cy.contains('No products found').should('be.visible');
    });
});
