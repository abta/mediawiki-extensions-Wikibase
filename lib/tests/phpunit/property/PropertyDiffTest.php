<?php
namespace Wikibase\Test;
use \Wikibase\Entity;
/**
 * Tests for the Wikibase\PropertyObject deriving classes.
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
 * @ingroup WikibaseLib
 * @ingroup Test
 *
 * @group Wikibase
 * @group WikibaseLib
 * @group WikibaseDiff
 *
 * @licence GNU GPL v2+
 * @author Jens Ohlig <jens.ohlig@wikimedia.de>
 */

class PropertyDiffTest extends EntityDiffTest {
	public function provideApplyData() {
		return parent::generateApplyData( \Wikibase\Property::ENTITY_TYPE );
	}

	/**
	 *
	 * @dataProvider provideApplyData
	 */
	public function testApply( Entity $a, Entity $b ) {
		parent::testApply( $a, $b );
	}
}
