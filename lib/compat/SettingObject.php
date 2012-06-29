<?php

class SettingObject extends ArgumentDefinitionObject implements Setting {

	/**
	 * @var string
	 */
	protected $name;

	/**
	 * @var string
	 */
	protected $type = 'unknown';

	/**
	 * @var boolean
	 */
	protected $isList = false;

	/**
	 * @param string $name
	 */
	public function __construct( $name ) {
		$this->name = $name;
	}

	/**
	 * @see ArgumentDefinition::getName
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * @see ArgumentDefinition::getType
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * @see ArgumentDefinition::isList
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function isList() {
		return $this->isList;
	}

	/**
	 * @see ArgumentDefinition::isRequired
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function isRequired() {
		return is_null( $this->default );
	}

	/**
	 * @see ArgumentDefinition::getDefault
	 *
	 * @since 0.1
	 *
	 * @return mixed
	 */
	public function getDefault() {
		return $this->default;
	}

	/**
	 * @see ArgumentDefinition::getMessage
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getMessage() {
		return $this->message;
	}

}