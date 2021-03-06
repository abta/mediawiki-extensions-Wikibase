<?php

namespace Wikibase\Test;
use Wikibase\Item;
use Wikibase\Property;
use Wikibase\ItemObject;
use Wikibase\PropertyObject;

/**
 * Tests for the Wikibase\CachedEntity class.
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
 * @since 0.1
 *
 * @ingroup WikibaseClient
 * @ingroup Test
 *
 * @group Database
 * @group Wikibase
 * @group WikibaseClient
 * @group WikibaseEntityCache
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
class CachedEntityTest extends \ORMRowTest {

	/**
	 * @see ORMRowTest::getRowClass()
	 * @since 0.1
	 * @return string
	 */
	protected function getRowClass() {
		return '\Wikibase\CachedEntity';
	}

	/**
	 * @see ORMRowTest::getTableInstance()
	 * @since 0.1
	 * @return \IORMTable
	 */
	protected function getTableInstance() {
		return new \Wikibase\EntityCacheTable();
	}

	public function constructorTestProvider() {
		return array(
			array(
				array(
					'entity_id' => 42,
					'entity_type' => Item::ENTITY_TYPE,
					'entity_data' => ItemObject::newEmpty(),
				),
				true
			),
			array(
				array(
					'entity_id' => 42,
					'entity_type' => Property::ENTITY_TYPE,
					'entity_data' => PropertyObject::newEmpty(),
				),
				true
			),
		);
	}

	/**
	 * @dataProvider constructorTestProvider
	 */
	public function testGetEntity( array $data, $loadDefaults ) {
		$cachedEntity = $this->getRowInstance( $data, $loadDefaults );

		$this->assertInstanceOf( '\Wikibase\Entity', $cachedEntity->getEntity() );
	}

}
	