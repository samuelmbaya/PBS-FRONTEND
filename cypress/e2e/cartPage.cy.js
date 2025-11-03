/// <reference types="cypress" />

describe("Cart Page (Frontend Only)", () => {
  const frontendUrl = "http://localhost:5173"; // your Vite dev URL

  const mockUser = { name: "Sam", email: "sam@example.com" };
  const mockCart = [
    { _id: "1", name: "Air Max 90", price: 2200, quantity: 1, imageURL: "https://via.placeholder.com/100" },
    { _id: "2", name: "Jordan Retro", price: 3000, quantity: 2, imageURL: "https://via.placeholder.com/100" },
  ];

  beforeEach(() => {
    // Set up user + cart in localStorage
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem(`cart_${mockUser.email}`, JSON.stringify(mockCart));

    cy.visit(`${frontendUrl}/Cart`);
  });

  // ---------- RENDER ----------
  it("renders the cart with products and total", () => {
    cy.contains("Your Cart").should("be.visible");
    cy.get(".cart-item").should("have.length", 2);
    cy.contains("Air Max 90").should("exist");
    cy.contains("Jordan Retro").should("exist");
    cy.contains("Total: R").should("exist");
  });

  // ---------- INCREASE ----------
  it("increases product quantity and updates total", () => {
    cy.get(".cart-item").first().within(() => {
      cy.get(".quantity-controls button").contains("+").click();
      cy.get(".quantity-controls span").should("contain", "2");
    });

    cy.window().then((win) => {
      const cart = JSON.parse(win.localStorage.getItem(`cart_${mockUser.email}`));
      expect(cart[0].quantity).to.equal(2);
    });

    cy.get(".cart-summary h2").should("contain", "Total: R");
  });

  // ---------- DECREASE ----------
  it("decreases product quantity but not below 1", () => {
    cy.get(".cart-item").eq(1).within(() => {
      cy.get(".quantity-controls span").should("contain", "2");
      cy.get(".quantity-controls button").contains("-").click();
      cy.get(".quantity-controls span").should("contain", "1");
      cy.get(".quantity-controls button").contains("-").click(); // Try again
      cy.get(".quantity-controls span").should("contain", "1");
    });

    cy.window().then((win) => {
      const cart = JSON.parse(win.localStorage.getItem(`cart_${mockUser.email}`));
      expect(cart[1].quantity).to.equal(1);
    });
  });

  // ---------- REMOVE ----------
  it("removes a product from the cart", () => {
    cy.get(".cart-item").first().within(() => {
      cy.contains("Remove").click();
    });

    cy.get(".cart-item").should("have.length", 1);
    cy.contains("Jordan Retro").should("exist");
    cy.window().then((win) => {
      const cart = JSON.parse(win.localStorage.getItem(`cart_${mockUser.email}`));
      expect(cart).to.have.length(1);
      expect(cart[0].name).to.equal("Jordan Retro");
    });
  });

  // ---------- EMPTY CART ----------
  it("shows 'Your cart is empty' when no items left", () => {
    cy.get(".remove-btn").each(($btn) => cy.wrap($btn).click());
    cy.contains("Your cart is empty.").should("be.visible");
  });

  // ---------- CONTINUE SHOPPING ----------
  it("navigates to ProductPage when 'Continue Shopping' clicked", () => {
    cy.contains("Continue Shopping").click();
    cy.url().should("include", "/ProductPage");
  });

  // ---------- CHECKOUT ----------
  it("navigates to delivery page on checkout", () => {
    cy.contains("Proceed to Checkout").click();
    cy.url().should("include", "/delivery");
  });
});
