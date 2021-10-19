import {
  readEraRecordAndContractEraRecordFiles,
  calcContractStakeAndReward,
} from "../common/eraRecord";
import { formatSDN, getContractAddress } from "../common/utils";

const main = () => {
  const contractAddress = getContractAddress(process.argv[2]);

  const records = readEraRecordAndContractEraRecordFiles(contractAddress);

  for (const record of records) {
    const { stake, devReward, stakersReward } = calcContractStakeAndReward(
      record
    );

    console.log(`era ${record.era}
  stakers ${record.contractEraRecord.stakers.length}
  stake ${formatSDN(stake)}
  stake share ${(100n * stake) / record.eraRecord.stake}%
  dev reward ${formatSDN(devReward)}
  stakers reward ${formatSDN(stakersReward)}`);
  }
};

main();
