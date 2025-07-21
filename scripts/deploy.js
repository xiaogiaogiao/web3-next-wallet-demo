/**
 * 合约部署脚本
 * 用于部署SimpleERC20代币合约到测试网
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署SimpleERC20合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 部署合约
  const SimpleERC20 = await ethers.getContractFactory("SimpleERC20");
  const token = await SimpleERC20.deploy(
    "Demo Token",      // 代币名称
    "DEMO",           // 代币符号
    18,               // 精度
    1000000           // 初始供应量（100万代币）
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("SimpleERC20合约部署成功!");
  console.log("合约地址:", tokenAddress);
  console.log("代币名称:", await token.name());
  console.log("代币符号:", await token.symbol());
  console.log("代币精度:", await token.decimals());
  console.log("总供应量:", ethers.formatEther(await token.totalSupply()));

  // 验证合约
  console.log("\n等待区块确认...");
  await token.deploymentTransaction().wait(5);

  console.log("合约部署完成!");
  console.log("请将以下地址添加到你的应用中:");
  console.log("合约地址:", tokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 