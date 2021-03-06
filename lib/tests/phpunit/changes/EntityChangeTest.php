<?php

namespace Wikibase\Test;
use Wikibase\EntityChange;
use Wikibase\Entity;

/**
 * Tests for the Wikibase\EntityChange class.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 * @since 0.3
*
 * @ingroup WikibaseLib
 * @ingroup Test
 *
 * @group Wikibase
 * @group WikibaseLib
 * @group WikibaseChange
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 * @author Katie Filbert < aude.wiki@gmail.com >
 */
class EntityChangeTest extends \MediaWikiTestCase {

	protected function getClass() {
		return 'Wikibase\EntityChange';
	}

	public function instanceProvider() {
		$class = $this->getClass();
		return array_map(
			function( Entity $entity ) use ( $class ) {
				return array( $class::newFromEntity( $entity ) );
			},
			TestChanges::getEntities()
		);
	}

	public function entityProvider() {
		return array_map(
			function( Entity $entity ) {
				return array( $entity );
			},
			TestChanges::getEntities()
		);
	}

	/**
	 * @dataProvider entityProvider
	 *
	 * @param \Wikibase\Entity $entity
	 */
	public function testNewFromEntity( Entity $entity ) {
		$class = $this->getClass();
		$entityChange = $class::newFromEntity( $entity );
		$this->assertInstanceOf( $class, $entityChange );
		$this->assertEquals( $entity, $entityChange->getEntity() );
	}

	/**
	 * @dataProvider instanceProvider
	 *
	 * @param \Wikibase\EntityChange $entityChange
	 */
	public function testGetType( EntityChange $entityChange ) {
		$this->assertInternalType( 'string', $entityChange->getType() );
	}

	/**
	 * @dataProvider entityProvider
	 *
	 * @param \Wikibase\Entity $entity
	 */
	public function testSetAndGetEntity( Entity $entity ) {
		$class = $this->getClass();
        $entityChange = $class::newFromEntity( $entity );
		$entityChange->setEntity( $entity );
		$this->assertEquals( $entity, $entityChange->getEntity() );
	}

	/**
	 * @dataProvider instanceProvider
	 * @since 0.3
	 */
	public function testMetadata( EntityChange $entityChange ) {
		$entityChange->setMetadata( array(
			'rc_user' => 0,
			'rc_user_text' => '208.80.152.201'
		) );
		$this->assertEquals(
			array(
				'rc_user' => 0,
				'rc_user_text' => '208.80.152.201'
			),
			$entityChange->getMetadata()
		);
	}

	/**
	 * @dataProvider instanceProvider
	 * @since 0.3
	 */
	public function testSetInvalidMetadata( EntityChange $entityChange ) {
		$entityChange->setMetadata( array(
			'rc_kittens' => 3,
			'rc_user' => 0,
			'rc_user_text' => '171.80.182.208'
		) );
		$this->assertEquals(
			array(
				'rc_user' => 0,
				'rc_user_text' => '171.80.182.208'
			),
			$entityChange->getMetadata()
		);
	}

	/**
	 * @dataProvider instanceProvider
	 * @since 0.3
	 */
	public function testGetEmptyMetadata( EntityChange $entityChange ) {
		$entityChange->setField( 'info', array() );
		$this->assertEquals(
			false,
			$entityChange->getMetadata()
		);
	}
}
