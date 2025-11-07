/**
 * 工具类store模块统一导出文件
 * 
 * 此文件提供所有工具类store模块的统一导入导出，
 * 便于在组件中快速引用所需的store模块
 */

// Converter工具模块
import { useCsvToJsonStore } from './converter/CsvToJson.js';
import { useExcelToJsonStore } from './converter/ExcelToJson.js';
import { useFormatConverterStore } from './converter/FormatConverter.js';
import { useJsonFormatterStore } from './converter/JsonFormatter.js';
import { useSqlFormatterStore } from './converter/SqlFormatter.js';
import { useTimestampConverterStore } from './converter/TimestampConverter.js';
import { useUrlEncodeStore } from './converter/UrlEncode.js';
import { useXmlFormatterStore } from './converter/XmlFormatter.js';

// Crypto加密模块
import { useAesEncryptStore } from './crypto/AesEncrypt.js';
import { useJwtParseStore } from './crypto/JwtParse.js';
import { useRsaEncryptStore } from './crypto/RsaEncrypt.js';

// CTF工具模块
import { useCaesarCipherStore } from './ctf/CaesarCipher.js';

// Encoding编码模块
import { useEncodingConverterStore } from './encoding/EncodingConverter.js';
import { useHtmlEncodeStore } from './encoding/HtmlEncode.js';
import { useUrlEncodeStore as useUrlEncodeStore2 } from './encoding/UrlEncode.js';

// Format格式化模块
import { useJsonFormatterStore as useJsonFormatterStore2 } from './format/JsonFormatter.js';

// Generator生成器模块
import { useColorPickerStore } from './generator/ColorPicker.js';
import { usePasswordGeneratorStore } from './generator/PasswordGenerator.js';
import { useQrCodeGeneratorStore } from './generator/QrCodeGenerator.js';
import { useUuidGeneratorStore } from './generator/UuidGenerator.js';

// Hash哈希模块
import { useFileHashStore } from './hash/FileHash.js';
import { useHashCalculatorStore } from './hash/HashCalculator.js';

// Tester测试模块
import { useRegexTesterStore } from './tester/RegexTester.js';

// 重新导出所有store
export {
  useCsvToJsonStore,
  useExcelToJsonStore,
  useFormatConverterStore,
  useJsonFormatterStore,
  useSqlFormatterStore,
  useTimestampConverterStore,
  useUrlEncodeStore,
  useXmlFormatterStore,
  useAesEncryptStore,
  useJwtParseStore,
  useRsaEncryptStore,
  useCaesarCipherStore,
  useEncodingConverterStore,
  useHtmlEncodeStore,
  useUrlEncodeStore2,
  useJsonFormatterStore2,
  useColorPickerStore,
  usePasswordGeneratorStore,
  useQrCodeGeneratorStore,
  useUuidGeneratorStore,
  useFileHashStore,
  useHashCalculatorStore,
  useRegexTesterStore
};

// 按类别导出所有store
export const converterStores = {
  useCsvToJsonStore,
  useExcelToJsonStore,
  useFormatConverterStore,
  useJsonFormatterStore,
  useSqlFormatterStore,
  useTimestampConverterStore,
  useUrlEncodeStore,
  useXmlFormatterStore
};

export const cryptoStores = {
  useAesEncryptStore,
  useJwtParseStore,
  useRsaEncryptStore
};

export const ctfStores = {
  useCaesarCipherStore
};

export const encodingStores = {
  useEncodingConverterStore,
  useHtmlEncodeStore,
  useUrlEncodeStore: useUrlEncodeStore2
};

export const formatStores = {
  useJsonFormatterStore: useJsonFormatterStore2
};

export const generatorStores = {
  useColorPickerStore,
  usePasswordGeneratorStore,
  useQrCodeGeneratorStore,
  useUuidGeneratorStore
};

export const hashStores = {
  useFileHashStore,
  useHashCalculatorStore
};

export const testerStores = {
  useRegexTesterStore
};

// 所有store的集合
export const allStores = {
  ...converterStores,
  ...cryptoStores,
  ...ctfStores,
  ...encodingStores,
  ...formatStores,
  ...generatorStores,
  ...hashStores,
  ...testerStores
};

// 获取所有store名称的辅助函数
export const getAllStoreNames = () => {
  return Object.keys(allStores);
};

// 根据类别获取store名称的辅助函数
export const getStoreNamesByCategory = (category) => {
  const categoryMap = {
    converter: converterStores,
    crypto: cryptoStores,
    ctf: ctfStores,
    encoding: encodingStores,
    format: formatStores,
    generator: generatorStores,
    hash: hashStores,
    tester: testerStores
  };
  
  return categoryMap[category] ? Object.keys(categoryMap[category]) : [];
};