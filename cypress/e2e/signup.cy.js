/// <reference types="cypress" />

describe("Signup Page", () => {
  const frontendUrl = "http://localhost:5173"; // your Vite frontend
  const apiUrl = "http://localhost:3000"; // your backend

  beforeEach(() => {
    cy.visit(`${frontendUrl}/signup`);
  });

  it("renders signup form", () => {
    cy.contains("Sign Up").should("be.visible");
    cy.get('input[name="name"]').should("exist");
    cy.get('input[name="email"]').should("exist");
    cy.get('input[name="password"]').should("exist");
    cy.get('input[name="confirmPassword"]').should("exist");
  });

  it("shows error for invalid email", () => {
    cy.get('input[name="name"]').type("Sam");
    cy.get('input[name="email"]').type("invalidemail");
    cy.get('input[name="password"]').type("password123");
    cy.get('input[name="confirmPassword"]').type("password123");
    cy.get("form").submit();
    cy.contains("Please enter a valid email address").should("be.visible");
  });

  it("handles successful registration", () => {
    cy.intercept("POST", `${apiUrl}/signup`, {
      statusCode: 200,
      body: { message: "User created" },
    }).as("signupRequest");

    cy.get('input[name="name"]').type("Sam");
    cy.get('input[name="email"]').type("sam@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('input[name="confirmPassword"]').type("password123");
    cy.get("form").submit();

    cy.wait("@signupRequest");
    cy.contains("Registration successful!").should("be.visible");
  });
});
