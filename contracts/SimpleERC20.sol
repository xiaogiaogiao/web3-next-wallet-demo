// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * 简单的ERC20代币合约
 * 用于测试read-only调用功能
 */
contract SimpleERC20 is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     * @param decimals_ 代币精度
     * @param initialSupply 初始供应量
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply * 10**decimals_);
    }

    /**
     * 重写decimals函数
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * 铸造代币（仅所有者）
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * 销毁代币
     * @param amount 销毁数量
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
} 