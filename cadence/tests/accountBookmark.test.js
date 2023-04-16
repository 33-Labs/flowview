import path from "path";
import { emulator, init, deployContractByName, getAccountAddress } from "@onflow/flow-js-testing";
import { addAccountBookmark, attackEditAccountBookmark, editAccountBookmark, getBookmark, removeAccountBookmark } from "./src/accountBookmark";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("Account bookmark", ()=>{
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../");
    const logging = false;
    
    await init(basePath);
    await emulator.start({ logging });
    return await deployContracts()
  });
  
 // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });

  test("Owner can add/edit/remove bookmark", async () => {
    const alice = await getAccountAddress("Alice")
    const bob = await getAccountAddress("Bob")
    const [, error] = await addAccountBookmark(alice, bob, "Bob's account")
    expect(error).toBeNull()

    const [bookmark1, error2] = await getBookmark(alice, bob)
    expect(error2).toBeNull()
    expect(bookmark1.note).toBe("Bob's account")

    const [, error3] = await editAccountBookmark(alice, bob, "Bob's account note 2")
    expect(error3).toBeNull()
    const [bookmark2, error4] = await getBookmark(alice, bob)
    expect(error4).toBeNull()
    expect(bookmark2.note).toBe("Bob's account note 2")

    const [, error5] = await removeAccountBookmark(alice, bob)
    expect(error5).toBeNull()
    const [bookmark3, error6] = await getBookmark(alice, bob)
    expect(error6).toBeNull()
    expect(bookmark3).toBeNull()
  })
})

const deployContracts = async () => {
  const deployer = await getAccountAddress("Deployer")
  const contractName = "FlowviewAccountBookmark"
  const args = []
  return await deployContractByName({ to: deployer, name: contractName, args: args })
}
