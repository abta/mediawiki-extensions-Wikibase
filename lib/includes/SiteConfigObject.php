<?php

namespace Wikibase;

/**
 * Object for holing configuration for a single Site.
 *
 * @since 0.1
 *
 * @file
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class SiteConfigObject implements SiteConfig {

	protected $localId;
	protected $linkInline;
	protected $linkNavigation;
	protected $forward;
	protected $extraConfig;

	/**
	 * Constructor.
	 *
	 * @since 0.1
	 *
	 * @param string $localId
	 * @param boolean $linkInline
	 * @param boolean $linkNavigation
	 * @param boolean $forward
	 * @param boolean $allowTransclusion
	 * @param array $extraConfig
	 */
	public function __construct( $localId, $linkInline, $linkNavigation, $forward, array $extraConfig = array() ) {
		$this->localId = $localId;
		$this->linkInline = $linkInline;
		$this->linkNavigation = $linkNavigation;
		$this->forward = $forward;
		$this->extraConfig = $extraConfig;
	}

	/**
	 * @see SiteConfig::getLocalId()
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getLocalId() {
		return $this->localId;
	}

	/**
	 * @see SiteConfig::getLinkInline()
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function getLinkInline() {
		return $this->linkInline;
	}

	/**
	 * @see SiteConfig::getLinkNavigation()
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function getLinkNavigation() {
		return $this->linkNavigation;
	}

	/**
	 * @see SiteConfig::getForward()
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function getForward() {
		return $this->forward;
	}

	/**
	 * @see SiteConfig::getExtraInfo()
	 *
	 * @since 0.1
	 *
	 * @return array
	 */
	public function getExtraInfo() {
		return $this->extraConfig;
	}

}