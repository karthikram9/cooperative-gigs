@ECHO OFF
SETLOCAL

REM Maven Wrapper launcher
REM Downloads Apache Maven on first use; Maven does not need to be installed globally.

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"
SET "WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper"
SET "PROPERTIES_FILE=%WRAPPER_DIR%\maven-wrapper.properties"

IF NOT EXIST "%PROPERTIES_FILE%" (
  ECHO ERROR: %PROPERTIES_FILE% not found.
  EXIT /B 1
)

FOR /F "usebackq tokens=1,* delims==" %%A IN ("%PROPERTIES_FILE%") DO (
  IF "%%A"=="distributionUrl" SET "MAVEN_DIST_URL=%%B"
)

IF NOT DEFINED MAVEN_DIST_URL (
  ECHO ERROR: distributionUrl not found in maven-wrapper.properties.
  EXIT /B 1
)

SET "MAVEN_WRAPPER_HOME=%USERPROFILE%\.m2\wrapper\dists"
SET "MAVEN_HOME=%MAVEN_WRAPPER_HOME%\apache-maven-3.9.11"
SET "MAVEN_ZIP=%TEMP%\apache-maven-3.9.11-bin.zip"

IF NOT EXIST "%MAVEN_HOME%\bin\mvn.cmd" (
  ECHO Downloading Apache Maven 3.9.11...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%MAVEN_DIST_URL%' -OutFile '%MAVEN_ZIP%'"
  IF ERRORLEVEL 1 (
    ECHO ERROR: Could not download Maven. Check your internet connection.
    EXIT /B 1
  )

  IF NOT EXIST "%MAVEN_WRAPPER_HOME%" MKDIR "%MAVEN_WRAPPER_HOME%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%MAVEN_ZIP%' -DestinationPath '%MAVEN_WRAPPER_HOME%' -Force"
  IF ERRORLEVEL 1 (
    ECHO ERROR: Could not extract Maven.
    EXIT /B 1
  )
  DEL /Q "%MAVEN_ZIP%" >NUL 2>&1
)

CALL "%MAVEN_HOME%\bin\mvn.cmd" %*
EXIT /B %ERRORLEVEL%
