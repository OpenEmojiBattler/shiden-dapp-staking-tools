import {
  readEraRecordAndContractEraRecordFiles,
  calcContractStakeAndReward,
} from "../common/eraRecord";
import { formatSDN, getContractAddressArg } from "../common/utils";

const main = () => {
  const contractAddress = getContractAddressArg(process.argv[2]);

  const records = readEraRecordAndContractEraRecordFiles(contractAddress);

  for (const record of records) {
    const { stake, devReward, stakersReward } = calcContractStakeAndReward(
      record
    );

    const stakersActualReward = record.contractEraRecord.stakers
      .map(({ reward }) => reward)
      .reduce((a, b) => a + b);

    console.log(`era ${record.era}
  stakers ${record.contractEraRecord.stakers.length}
  stake ${formatSDN(stake)}
  stake share ${(100n * stake) / record.eraRecord.stake}%
  dev reward (actual) ${formatSDN(record.contractEraRecord.developerReward)}
  dev reward (calc) ${formatSDN(devReward)}
  stakers reward (actual) ${formatSDN(stakersActualReward)}
  stakers reward (calc) ${formatSDN(stakersReward)}`);
  }
};

main();
