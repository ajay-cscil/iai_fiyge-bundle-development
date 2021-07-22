<?php

\error_reporting(E_ALL);
\ini_set("display_errors", 1);

include_once 'JsonSchema/Constraints/ConstraintInterface.php';
include_once 'JsonSchema/Constraints/Constraint.php';
include_once 'JsonSchema/Constraints/Collection.php';
include_once 'JsonSchema/Constraints/Enum.php';
include_once 'JsonSchema/Constraints/Format.php';
include_once 'JsonSchema/Constraints/Number.php';
include_once 'JsonSchema/Constraints/Object.php';
include_once 'JsonSchema/Constraints/Schema.php';
include_once 'JsonSchema/Constraints/String.php';
include_once 'JsonSchema/Constraints/Type.php';
include_once 'JsonSchema/Constraints/Undefined.php';


include_once 'JsonSchema/Uri/Retrievers/UriRetrieverInterface.php';
include_once 'JsonSchema/Uri/Retrievers/AbstractRetriever.php';
include_once 'JsonSchema/Uri/UriRetriever.php';
include_once 'JsonSchema/Uri/UriResolver.php';
include_once 'JsonSchema/Uri/Retrievers/Curl.php';
include_once 'JsonSchema/Uri/Retrievers/FileGetContents.php';
include_once 'JsonSchema/Uri/Retrievers/PredefinedArray.php';


include_once 'JsonSchema/Exception/InvalidArgumentException.php';
include_once 'JsonSchema/Exception/InvalidSchemaMediaTypeException.php';
include_once 'JsonSchema/Exception/InvalidSourceUriException.php';
include_once 'JsonSchema/Exception/JsonDecodingException.php';
include_once 'JsonSchema/Exception/ResourceNotFoundException.php';
include_once 'JsonSchema/Exception/UriResolverException.php';

include_once 'JsonSchema/RefResolver.php';
include_once 'JsonSchema/Validator.php';



