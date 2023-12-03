import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe.only("Vault", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, investor] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("Mark USD", "MUSD");

    await token
      .connect(owner)
      .transfer(investor.address, ethers.utils.parseEther("1"));

    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(token.address, "Vault Mark USD", "vMUSD");

    return { vault, token, owner, investor };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      expect(vault.address).to.not.equal(0);
    });
  });

  describe("Preview", function () {
    it("Should preview deposit", async function () {
      const { vault, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      const shares = await vault.connect(investor).previewDeposit(amount);
      expect(shares).to.equal(amount);
    });
    it("Should preview withdraw", async function () {
      const { vault, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      const shares = await vault.connect(investor).previewWithdraw(amount);
      expect(shares).to.equal(amount);
    });

    it("should preview mint", async function () {
      const { vault, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      const shares = await vault.connect(investor).previewMint(amount);
      expect(shares).to.equal(amount);
    });

    it("should preview redeem", async function () {
      const { vault, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      const shares = await vault.connect(investor).previewRedeem(amount);
      expect(shares).to.equal(amount);
    });
  });

  describe("Deposit", function () {
    it("Should deposit", async function () {
      const { vault, token, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      await token.connect(investor).approve(vault.address, amount);
      console.log(`Depositing ${amount} ${await token.symbol()}`);

      await vault.connect(investor).deposit(amount, investor.address);
      const balance = await vault.balanceOf(investor.address);

      console.log(`Credited ${amount} ${await vault.symbol()} in the vault`);

      expect(balance).to.equal(amount);
    });
  });

  describe("Withdraw", function () {
    it("Should withdraw", async function () {
      const { vault, token, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      await token.connect(investor).approve(vault.address, amount);
      await vault.connect(investor).deposit(amount, investor.address);
      await vault
        .connect(investor)
        .withdraw(amount, investor.address, investor.address);
      const balance = await vault.balanceOf(investor.address);
      console.log(`Received ${amount} ${await vault.symbol()} from the vault`);
      expect(balance).to.equal(0);
    });
  });

  describe("Redeem", function () {
    it("Should redeem", async function () {
      const { vault, token, investor } = await loadFixture(deployVaultFixture);
      const amount = ethers.utils.parseEther("1");
      await token.connect(investor).approve(vault.address, amount);
      await vault.connect(investor).deposit(amount, investor.address);
      await vault
        .connect(investor)
        .redeem(amount, investor.address, investor.address);
      const vaultBalance = await vault.balanceOf(investor.address);
      expect(vaultBalance).to.equal(0);

      const tokenBalance = await token.balanceOf(investor.address);
      expect(tokenBalance).to.equal(amount);
      console.log(
        `Received ${amount} ${await token.symbol()} to investor wallet`
      );
    });
  });
});
