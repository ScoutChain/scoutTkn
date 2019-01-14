pragma solidity ^0.5.0;

import "./helper/ERC20.sol";
import "./helper/ERC20Detailed.sol";
import "./helper/Pausable.sol";

/**
 * @title SCTtoken
 */
contract SCTtoken is ERC20, ERC20Detailed , Pausable{
    uint8 public constant DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 1000000000 * (10 ** uint256(DECIMALS));
    uint256 private _totalSupply ;
    mapping (address => uint256) private _balances;

    constructor () public ERC20Detailed("ScoutToken", "SCT", DECIMALS) {
        _balances[msg.sender] = INITIAL_SUPPLY;
        _totalSupply = INITIAL_SUPPLY;
    }

    using SafeMath for uint256;

    mapping (address => mapping (address => uint256)) private _allowed;   
	mapping (address => uint256) public freezeOf;
    mapping (address => bool) public frozenAccount;
    event FrozenFunds(address target, bool frozen);
    event Freeze(address indexed from, uint256 value);
    event Unfreeze(address indexed from, uint256 value);   

    function totalSupply() public view  
    returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) public view 
    returns (uint256) {
        return _balances[owner];
    }


    function freezeAccount(address target, bool freeze) public onlyOwner {
        frozenAccount[target] = freeze;
        emit FrozenFunds(target, freeze);
    }

    function allowance(address owner, address spender) public view 
    returns (uint256) {
        return _allowed[owner][spender];
    }
 

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = _allowed[msg.sender][spender].add(addedValue);
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = _allowed[msg.sender][spender].sub(subtractedValue);
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    function transfer(address to, uint256 value) public whenNotPaused
  returns (bool) {
        require(to != address(0) &&!frozenAccount[msg.sender]);  
	
        _transfer(msg.sender, to, value);
        return true;
    }
 
    function transferFrom(address from, address to, uint256 value) public whenNotPaused
  returns (bool) {
        require(to != address(0) &&!frozenAccount[from]); 

        _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(value);
        _transfer(from, to, value);
        emit Approval(from, msg.sender, _allowed[from][msg.sender]);
        return true;
    }

    function approve(address spender, uint256 value) public 
  returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function freeze(uint256 _value) public  returns (bool success) {
        require(_balances[msg.sender] >= _value && _value > 0);

        _balances[msg.sender] = SafeMath.sub(_balances[msg.sender], _value);  
        freezeOf[msg.sender] = SafeMath.add(freezeOf[msg.sender], _value);    
        emit Freeze(msg.sender, _value);
        return true;
    }
	
    function unfreeze(uint256 _value) public returns (bool success) {
        require(freezeOf[msg.sender] >= _value && _value > 0);

        freezeOf[msg.sender] = SafeMath.sub(freezeOf[msg.sender], _value);    
		_balances[msg.sender] = SafeMath.add(_balances[msg.sender], _value);
        emit Unfreeze(msg.sender, _value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal 
 {
        require(to != address(0));

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }
 
}