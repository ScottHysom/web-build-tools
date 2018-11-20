// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

/**
 * Core libraries that every NodeJS toolchain project should use.
 *
 * @packagedocumentation
 */

export {
  FileConstants,
  FolderConstants
} from './Constants';
export {
  ExecutableStdioStreamMapping,
  ExecutableStdioMapping,
  IExecutableResolveOptions,
  IExecutableSpawnSyncOptions,
  Executable
} from './Executable';
export { FileDiffTest } from './FileDiffTest';
export {
  IPackageJson,
  IPackageJsonDependencyTable,
  IPackageJsonScriptTable,
  IPackageJsonTsdocConfiguration
} from './IPackageJson';
export {
  JsonFile,
  IJsonFileSaveOptions,
  IJsonFileStringifyOptions
} from './JsonFile';
export {
  JsonSchema,
  IJsonSchemaErrorInfo,
  IJsonSchemaValidateOptions,
  IJsonSchemaFromFileOptions
} from './JsonSchema';
export {
  LockFile
} from './LockFile';
export {
  MapExtensions
} from './MapExtensions';
export { PosixModeBits } from './PosixModeBits';
export {
  ProtectableMap,
  IProtectableMapParameters
} from './ProtectableMap';
export {
  IPackageJsonLookupParameters,
  PackageJsonLookup
} from './PackageJsonLookup';
export { PackageName, IParsedPackageName, IParsedPackageNameOrError } from './PackageName';
export { Path } from './Path';
export { Text, NewlineKind } from './Text';
export { Sort } from './Sort';
export {
  FileSystem,
  IFileSystemReadFolderOptions,
  IFileSystemWriteFileOptions,
  IFileSystemReadFileOptions,
  IFileSystemMoveOptions,
  IFileSystemCopyFileOptions,
  IFileSystemDeleteFileOptions,
  IFileSystemUpdateTimeParameters,
  IFileSystemCreateLinkOptions
} from './FileSystem';
export {
  FileWriter,
  IFileWriterFlags
} from './FileWriter';
export {
  LegacyAdapters,
  callback
} from './LegacyAdapters';
export { StringBuilder, IStringBuilder } from './StringBuilder';
export { Terminal } from './Terminal/Terminal';
export {
  Colors,
  IColorableSequence
} from './Terminal/Colors';
export {
  ITerminalProvider,
  TerminalProviderSeverity
} from './Terminal/ITerminalProvider';
export {
  ConsoleTerminalProvider,
  IConsoleTerminalProviderOptions
} from './Terminal/ConsoleTerminalProvider';
