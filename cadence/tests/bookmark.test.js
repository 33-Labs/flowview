import path from "path";
import { emulator, init, deployContractByName, getAccountAddress } from "@onflow/flow-js-testing";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("bookmark", ()=>{
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const logging = false;
    
    await init(basePath);
    return emulator.start({ logging });
  });
  
 // Stop emulator, so it could be restarted
  afterEach(async () => {
    return emulator.stop();
  });
  
  test("Deployment", async () => {
    const [, error] = await deployContracts()
    expect(error).toBeNull()
  })
})

const deployContracts = async () => {
  const deployer = await getAccountAddress("Deployer")
  const contractName = "Bookmark"
  const args = []
  return await deployContractByName({ to: deployer, name: contractName, args: args })
}
