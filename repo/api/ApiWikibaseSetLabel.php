<?php

/**
 * API module to set a label for a Wikibase item.
 *
 * @since 0.1
 *
 * @file ApiWikibaseSetLabel.php
 * @ingroup Wikibase
 * @ingroup API
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class ApiWikibaseSetLabel extends ApiBase {

	/**
	 * Main method. Does the actual work and sets the result.
	 *
	 * @since 0.1
	 */
	public function execute() {
		// TODO: implement
	}

	public function needsToken() {
		return true;
	}

	public function mustBePosted() {
		return true;
	}

	public function getAllowedParams() {
		return array(
			'id' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => true,
			),
			'language' => array(
				ApiBase::PARAM_TYPE => array(), // TODO: language code list
				ApiBase::PARAM_REQUIRED => true,
			),
			'label' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			),
		);
	}

	public function getParamDescription() {
		return array(
			'id' => 'The ID of the item to set a label for',
			'language' => 'Language the label is in',
			'label' => 'The value to set for the label',
		);
	}

	public function getDescription() {
		return array(
			'API module to set a label for a Wikibase item.'
		);
	}

	public function getPossibleErrors() {
		return array_merge( parent::getPossibleErrors(), array(
		) );
	}

	protected function getExamples() {
		return array(
			'api.php?action=wbsetlabel&id=42&language=en&label=Wikipedia',
		);
	}

	public function getVersion() {
		return __CLASS__ . ': $Id$';
	}

}