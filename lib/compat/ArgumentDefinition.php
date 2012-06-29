<?php

/**
 * Interface for argument definitions.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * @since 0.1
 *
 * @file
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */
interface ArgumentDefinition {

	/**
	 * Returns the name of the argument.
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getName();

	/**
	 * Returns the type of the argument.
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getType();

	/**
	 * Returns if the argument is a list.
	 * This is complementary info to the type.
	 * If an argument is a boolean and it's a list, then it's a list of booleans.
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function isList();

	/**
	 * Returns if the argument is a list.
	 * This is complementary info to the type.
	 * If an argument is a boolean and it's a list, then it's a list of booleans.
	 *
	 * @since 0.1
	 *
	 * @return boolean
	 */
	public function isRequired();

	/**
	 * Returns the default value for the argument.
	 *
	 * @since 0.1
	 *
	 * @return mixed
	 */
	public function getDefault();

	/**
	 * Returns a message key for a description of the argument.
	 *
	 * @since 0.1
	 *
	 * @return string
	 */
	public function getMessage();

}