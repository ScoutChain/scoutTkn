const SCTtoken = artifacts.require("./SCTtoken.sol");
const expectThrow = require('./expectThrow');
contract("SCTtoken_Tests", async accounts => {
    
    
    const owner = accounts[0]
    const to = accounts[1]
    const other = accounts[2]
    const ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    const initial=1000000000 * (10 ** 18)//1000
    const amount = 100
    describe('transfer test', function () {
        it('transfers the requested amount', async function () {
            let instance = await SCTtoken.deployed();
            const { logs } = await instance.transfer(to, amount, { from: owner })
            let balance = await instance.balanceOf(owner);
            assert.equal(balance.toString(), initial-amount)
        })
        it('revert : transfer token over balance', async function () {
            let instance = await SCTtoken.deployed();
            let balance = await instance.balanceOf(owner);
            expectThrow(instance.transfer(to, balance+100, { from: owner }))
        })
        it('revert : transfer token lees than 0', async function () {
            let instance = await SCTtoken.deployed();
            expectThrow(instance.transfer(to, -1, { from: owner }))
        })
        it('invalid address : transfer token to zero_address', async function () {
            let instance = await SCTtoken.deployed();
            await expectThrow(instance.transfer(ZERO_ADDRESS, amount, { from: owner }))
        })

        it('emits a transfer event', async function () {
            let instance = await SCTtoken.deployed();
            const { logs } = await instance.transfer(to, amount, { from: owner })
            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'Transfer')
            assert.equal(logs[0].args.from, owner)
            assert.equal(logs[0].args.to, to)
            assert.equal(logs[0].args.value, amount)
        })
    })      
    describe('transferfrom test', function () {
        it('approve', async function () {
            let instance = await SCTtoken.deployed()
            const { logs } = await instance.approve(to, amount, { from: owner })
            assert.equal(logs[0].args.value, amount)
        })

        it('allowance', async function () {
            let instance = await SCTtoken.deployed()
            let balance = await instance.allowance(owner, to);
            assert.equal(balance.toString(), amount)
        })

        it('Increase allowance', async function () {
            let instance = await SCTtoken.deployed()
            await instance.approve(to, 0, { from: owner })
            const { logs }  = await instance.increaseAllowance(to,amount)
            assert.equal(logs[0].args.value.words[0], amount)
        })
        it('Decrease allowance', async function () {
            let instance = await SCTtoken.deployed()
            let balance = await instance.allowance(owner, to)
            const { logs }  = await instance.decreaseAllowance(to,amount)
            assert.equal(logs[0].args.value.words[0], balance-amount)

        })
        it('emit approve(Approval)', async function () {
            let instance = await SCTtoken.deployed()
            const {logs} = await instance.approve(owner, to);
            assert.equal(logs[0].event, 'Approval')
        })
        it('emit Increase allowance', async function () {
            let instance = await SCTtoken.deployed()
            await instance.approve(to, 0, { from: owner })
            const { logs }  = await instance.increaseAllowance(to,amount)
            assert.equal(logs[0].event, 'Approval')
        })
        it('emit Decrease allowance', async function () {
            let instance = await SCTtoken.deployed()
            let balance = await instance.allowance(owner, to)
            const { logs }  = await instance.decreaseAllowance(to,amount)
            assert.equal(logs[0].event, 'Approval')
        })

        it('emits a transferfrom(Transfer) event', async function () {
            let instance = await SCTtoken.deployed();
            await instance.approve(to, amount, { from: owner })
            const { logs } = await instance.transferFrom(owner, to, amount, { from: to })

            assert.equal(logs[0].event, 'Transfer')
            assert.equal(logs[0].args.from, owner)
            assert.equal(logs[0].args.to, to)
            assert.equal(logs[0].args.value, amount)
        })

        it('revert : Decrease allowance over allowance', async function () {
            let instance = await SCTtoken.deployed()
            let balance = await instance.allowance(owner, to)
            expectThrow(instance.decreaseAllowance(to,balance+amount), { from: owner })
            await instance.approve(to, 0, { from: owner })

        })
        it('revert : transferfrom over balance', async function () {
            let instance = await SCTtoken.deployed()
            await instance.approve(to, 0, { from: owner })
            let balance = await instance.balanceOf(owner)
            const {logs} = await instance.increaseAllowance(to,balance+amount)
             expectThrow(instance.transferFrom(owner, to, balance+amount), { from: to })
        })

        it('revert : transferfrom from other user ', async function () {
            let instance = await SCTtoken.deployed()
            await instance.approve(to, 0, { from: owner })
            let balance = await instance.balanceOf(owner)
            const {logs} = await instance.increaseAllowance(to,balance+amount)
             expectThrow(instance.transferFrom(other, to, balance+amount), { from: owner })
        })
        it('revert : transferfrom to other user ', async function () {
            let instance = await SCTtoken.deployed()
            await instance.approve(to, 0, { from: owner })
            let balance = await instance.balanceOf(owner)
            const {logs} = await instance.increaseAllowance(to,balance+amount)
             expectThrow(instance.transferFrom(owner, other, balance+amount), { from: owner })
        })
        it('revert : approve zero_address', async function () {
            let instance = await SCTtoken.deployed()
            expectThrow( instance.approve(ZERO_ADDRESS, amount), { from: owner })
        })
        it('revert : increaseAllowance  zero_address', async function () {
            let instance = await SCTtoken.deployed()
            expectThrow( instance.increaseAllowance(ZERO_ADDRESS, amount), { from: owner })
        })
        it('revert : decreaseAllowance zero_address', async function () {
            let instance = await SCTtoken.deployed()
            expectThrow( instance.decreaseAllowance(ZERO_ADDRESS, amount), { from: owner })
        })
    })                    
    describe('when token is paused', function () {
        it('pauses the token', async function () {
            let instance =  await SCTtoken.deployed()
            await instance.pause({ from: owner })
            const paused = await instance.paused()
            assert.equal(paused, true)
            await instance.unpause({ from: owner })
        })
        it('emits a paused event', async function () {
            let instance =  await SCTtoken.deployed()
            const { logs } = await instance.pause({ from:owner })
            assert.equal(logs[0].event, 'Paused')
            await instance.unpause({ from: owner })
        })

        it('revert : pause again throw error', async function () {
            let instance =  await SCTtoken.deployed()
            await instance.pause({ from: owner })
            expectThrow( instance.pause({ from:owner }))
            await instance.unpause({ from: owner })
        })
        it('revert : transferfrom throw error', async function () {
            let instance =  await SCTtoken.deployed()
            await instance.pause({ from: owner })
            await instance.approve(to,amount,{ from: owner })
            expectThrow(instance.transferFrom(owner,to, amount, { from: owner }))
            await instance.unpause({ from: owner })
        })

        it('revert : pause from other not owner', async function () {
            let instance =  await SCTtoken.deployed();
             expectThrow( instance.pause({ from: to }))
        })

        it('freeze is working', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.pause({ from: owner })
            await instance.freeze(amount,{ from: owner })
            let freezeBalance = await instance.frozenBalance(owner)
             assert.equal(freezeBalance ,amount)
            await instance.unfreeze(amount,{ from: owner })
        })
    })
    describe('when token is unpaused', function () {
        it('unpauses the token', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.unpause({ from: owner })
            const paused = await instance.paused()
            assert.equal(paused, false)
            await instance.pause({ from: owner })
        })
        it('emits a paused event', async function () {
            let instance =  await SCTtoken.deployed();
            const { logs } = await instance.unpause({ from:owner })
             assert.equal(logs[0].event, 'Unpaused')
        })
        it('transfer is working', async function () {
            let instance =  await SCTtoken.deployed();
            const{ logs } = await instance.transfer(to, amount, { from: owner })
            assert.equal(logs[0].args.value, amount)
             instance.pause({ from: owner })
        })
        it('revert : unpause from other not owner', async function () {
            let instance =  await SCTtoken.deployed();
             expectThrow( instance.unpause({ from: to }))
        })
 

    })

    describe('when token is freeze', function () {

        it('revert : transfer', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.freeze(amount,{ from: owner })
            let balance = await instance.balanceOf(owner);
             expectThrow(instance.transfer(to, (balance+100), { from: owner }))
        })
        it('revert : freeze token over having amount', async function () {
            let instance =  await SCTtoken.deployed();
            let balance = await instance.balanceOf(owner);
            await expectThrow(instance.freeze(balance+100,{ from: owner }))
        })
        it('freeze is working', async function () {
            let instance =  await SCTtoken.deployed();
            let freezeBalance = await instance.frozenBalance(owner)
             assert.equal(freezeBalance.toString() ,amount)
            await instance.unfreeze(freezeBalance,{ from: owner })
        })
        it('emit a freeze event', async function () {
            let instance =  await SCTtoken.deployed();
            const { logs } = await instance.freeze(amount,{ from:owner })
            await assert.equal(logs[0].event, 'Freeze')
            await instance.unfreeze(amount,{ from: owner })
        })
    })  

    describe('when token is unfreeze', function () {

        it('revert : unfreeze token over freezing amount', async function () {
            let instance =  await SCTtoken.deployed();
            let balance = await instance.frozenBalance(owner);
            await expectThrow(instance.unfreeze(balance+100,{ from: owner }))
     
        })
        it('invalid address : unfreeze without freeze', async function () {
            let instance =  await SCTtoken.deployed();
            await expectThrow(instance.unfreeze(amount,{ from: to }))
     
        })
        it('unfreeze is working', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.freeze(amount,{ from: owner })
            let freezeBalance = await instance.frozenBalance(owner)
            await assert.equal(freezeBalance.toString() ,amount)
        })
        it('emit a unfreeze event', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.freeze(amount,{ from:owner })
            const { logs } = await instance.unfreeze(amount,{ from:owner })
            await assert.equal(logs[0].event, 'Unfreeze')
    
        })
    })  
  
    describe('when freeze account', function () {

        it('freeze account', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.freezeAccount(to, true, { from: owner })
            const frozenAccount =  await instance.frozenAccount(to, { from: owner })
            assert.equal(frozenAccount ,true)
            await instance.freezeAccount(to, false, { from: owner })
        })

       it('revert : freeze token zero-address', async function () {
            let instance =  await SCTtoken.deployed();
            await expectThrow(instance.freezeAccount(ZERO_ADDRESS, true, { from: owner }))
     
        })
        it('revert : freeze account from the other not owner', async function () {
            let instance =  await SCTtoken.deployed();
            await expectThrow(instance.freezeAccount(to, true,{ from: to }))
     
        })

        it('emit a FrozenFunds event', async function () {
            let instance =  await SCTtoken.deployed();
            const { logs } = await instance.freezeAccount(to, true, { from: owner })
            await assert.equal(logs[0].event, 'FrozenFunds')
            await instance.freezeAccount(to, false, { from: owner })
    
        })
    })  
    describe('when unfreeze account', function () {
        it('unfreeze account', async function () {
            let instance =  await SCTtoken.deployed();
            await instance.freezeAccount(to, false, { from: owner })
            const frozenAccount =  await instance.frozenAccount(to, { from: owner })
            assert.equal(frozenAccount ,false)
        })

        it('revert : unfreeze token zero-address', async function () {
            let instance =  await SCTtoken.deployed();
            await expectThrow(instance.freezeAccount(ZERO_ADDRESS, false, { from: owner }))
     
        })
        
        it('revert : unfreeze account from the other not owner', async function () {
            let instance =  await SCTtoken.deployed();
            await expectThrow(instance.freezeAccount(to, false,{ from: to }))
     
        })
        it('emit a FrozenFunds event', async function () {
            let instance =  await SCTtoken.deployed();
            const { logs } = await instance.freezeAccount(to, false, { from: owner })
            await assert.equal(logs[0].event, 'FrozenFunds')
    
        })
    })  
 })