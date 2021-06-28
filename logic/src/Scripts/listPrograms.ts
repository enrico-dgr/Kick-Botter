import { EnumNamesOfPrograms } from '../Executable';

console.log(`- Programs available:`);
for (var k in EnumNamesOfPrograms) {
  const val = EnumNamesOfPrograms[k];
  typeof val === "string" ? console.log("-- " + val) : undefined;
}
