<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:svg="http://www.w3.org/2000/svg" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs" version="2.0">
    <xsl:strip-space elements="*"/>
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:svg">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates select="svg:g"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:svg/svg:g">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <svg:g id="columns">
                <xsl:apply-templates/>
            </svg:g>
            <svg:g id="lines">
                <xsl:apply-templates select="//svg:line"/>
            </svg:g>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:line">
        <xsl:copy>
            <xsl:apply-templates select="@* except (@x1|@x2|@y1|@y2)"/>
            <xsl:attribute name="x1" select="number(@x1) + 100"/>
            <xsl:attribute name="x2" select="number(@x2) + 100"/>
            <xsl:attribute name="y1" select="number(@y1) - 57"/>
            <xsl:attribute name="y2" select="number(@y2) - 57"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
